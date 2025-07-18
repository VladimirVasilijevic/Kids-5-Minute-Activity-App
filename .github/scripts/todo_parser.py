import os
import re
import requests

GITHUB_TOKEN = os.environ['GITHUB_TOKEN']
REPO = os.environ['GITHUB_REPOSITORY']
API_URL = f"https://api.github.com/repos/{REPO}"

# Regex to match TODO blocks
todo_regex = re.compile(
    r"^TODO: (.*?) <!-- id: (task-\d{3}) -->\n(?:\*\*Acceptance Criteria\*\*\s*((?:\n- \[.\] .+)+))?",
    re.MULTILINE
)

def extract_todos(content):
    todos = []
    for match in todo_regex.finditer(content):
        title = match.group(1).strip()
        task_id = match.group(2).strip()
        criteria_raw = match.group(3)
        checklist = ""
        all_completed = True

        if criteria_raw:
            checklist_lines = []
            for line in criteria_raw.strip().splitlines():
                checklist_lines.append(line.strip())
                # Check if this line is a checkbox and if it's checked
                if line.strip().startswith('- [ ]'):
                    all_completed = False
                elif line.strip().startswith('- [x]'):
                    # This criterion is completed
                    pass
            checklist = "\n".join(checklist_lines)

        todos.append({
            'id': task_id,
            'title': title,
            'body': f"## Acceptance Criteria\n{checklist}" if checklist else "",
            'all_completed': all_completed and bool(checklist)  # Only mark as completed if there are criteria and all are checked
        })
    return todos

def get_existing_issues():
    issues = {}
    page = 1
    while True:
        response = requests.get(f"{API_URL}/issues?state=all&per_page=100&page={page}",
                                 headers={'Authorization': f"token {GITHUB_TOKEN}"})
        data = response.json()
        if not data:
            break
        for issue in data:
            if issue['title'].endswith('<!-- '):
                continue
            match = re.search(r'<!-- id: (task-\d{3}) -->', issue.get('body',''))
            if match:
                issues[match.group(1)] = issue
        page += 1
    return issues

def create_issue(todo, phase_label):
    data = {
        'title': f"{todo['title']} <!-- {todo['id']} -->",
        'body': f"{todo['body']}\n\n<!-- id: {todo['id']} -->",
        'labels': [phase_label]
    }
    response = requests.post(f"{API_URL}/issues",
                              json=data,
                              headers={'Authorization': f"token {GITHUB_TOKEN}"})
    response.raise_for_status()

def update_issue(issue_number, todo, phase_label):
    data = {
        'title': f"{todo['title']} <!-- {todo['id']} -->",
        'body': f"{todo['body']}\n\n<!-- id: {todo['id']} -->",
        'labels': [phase_label]
    }
    response = requests.patch(f"{API_URL}/issues/{issue_number}",
                               json=data,
                               headers={'Authorization': f"token {GITHUB_TOKEN}"})
    response.raise_for_status()

def close_issue(issue_number):
    data = {'state': 'closed'}
    response = requests.patch(f"{API_URL}/issues/{issue_number}",
                               json=data,
                               headers={'Authorization': f"token {GITHUB_TOKEN}"})
    response.raise_for_status()

def determine_phase_label(title):
    match = re.search(r"Phase (\d)", title)
    if match:
        return f"phase-{match.group(1)}"
    if "Optional" in title:
        return "optional"
    return "unlabeled"

if __name__ == "__main__":
    # Read all TODO.md files
    todo_files = []
    for root, dirs, files in os.walk("."):
        for file in files:
            if file.endswith("TODO.md"):
                todo_files.append(os.path.join(root, file))

    all_content = ""
    for file in todo_files:
        with open(file, "r", encoding="utf-8") as f:
            all_content += f.read() + "\n"

    todos = extract_todos(all_content)
    existing = get_existing_issues()

    # Create or update
    processed_ids = set()
    for todo in todos:
        phase_label = determine_phase_label(todo['title'])
        processed_ids.add(todo['id'])
        
        if todo['id'] in existing:
            existing_issue = existing[todo['id']]
            
            # If all acceptance criteria are completed and issue is open, close it
            if todo['all_completed'] and existing_issue['state'] == 'open':
                print(f"Closing issue {existing_issue['number']} for completed task {todo['id']}")
                close_issue(existing_issue['number'])
            # If not all completed and issue is closed, reopen it
            elif not todo['all_completed'] and existing_issue['state'] == 'closed':
                print(f"Reopening issue {existing_issue['number']} for incomplete task {todo['id']}")
                update_issue(existing_issue['number'], todo, phase_label)
            # Otherwise just update the issue
            else:
                update_issue(existing_issue['number'], todo, phase_label)
        else:
            # Only create new issue if not all criteria are completed
            if not todo['all_completed']:
                create_issue(todo, phase_label)
            else:
                print(f"Skipping creation of issue for already completed task {todo['id']}")

    # Close removed tasks
    for task_id, issue in existing.items():
        if task_id not in processed_ids:
            print(f"Closing issue {issue['number']} for removed {task_id}")
            close_issue(issue['number'])
