# Firebase Admin Scripts

This directory contains refactored Firebase admin scripts for managing users, data, and backups in both development and production environments.

## 📁 Directory Structure

```
scripts/
├── shared/                    # Shared utilities and configuration
│   ├── config.js             # Firebase initialization and validation
│   └── firestore.js          # Firestore operations and data import
├── dev/                      # Development environment scripts
│   ├── create-user.js        # Create new users
│   ├── assign-role.js        # Assign roles to users
│   ├── import-data.js        # Import data from JSON files
│   ├── delete-user.js        # Delete users
│   ├── list-users.js         # List all users with details
│   └── backup-data.js        # Backup all data
└── prod/                     # Production environment scripts
    ├── create-user.js        # Create new users (with warnings)
    ├── assign-role.js        # Assign roles to users (with warnings)
    ├── import-data.js        # Import data from JSON files (with warnings)
    ├── delete-user.js        # Delete users (with warnings)
    ├── list-users.js         # List all users with details
    └── backup-data.js        # Backup all data (with warnings)
```

## 🔧 Prerequisites

1. **Service Account Keys**: Ensure you have the following files in the scripts directory:
   - `serviceAccountKey-dev.json` (for development)
   - `serviceAccountKey-prod.json` (for production)

2. **JSON Data Files**: Ensure the following files exist in `src/assets/`:
   - `activities_en.json`, `activities_sr.json`
   - `blog-posts_en.json`, `blog-posts_sr.json`
   - `categories_en.json`, `categories_sr.json`
   - `about_en.json`, `about_sr.json`

## 🚀 Usage

### Development Environment

#### Create User
```bash
node dev/create-user.js <email> <password> [role]
```
**Roles**: `admin`, `subscriber`, `trial`, `free`
**Example**: `node dev/create-user.js test@example.com password123 admin`

#### Assign Role
```bash
node dev/assign-role.js <userId> <role>
```
**Example**: `node dev/assign-role.js abc123 admin`

#### Import Data
```bash
node dev/import-data.js <type>
```
**Types**: `activities`, `blog`, `categories`, `about`, `all`
**Examples**:
- `node dev/import-data.js activities` (imports both EN and SR)
- `node dev/import-data.js all` (imports everything)

#### Delete User
```bash
node dev/delete-user.js <userId>
```
**Example**: `node dev/delete-user.js abc123`

#### List Users
```bash
node dev/list-users.js
```
Outputs detailed user information in JSON format.

#### Backup Data
```bash
node dev/backup-data.js [outputPath]
```
**Default**: `./backups/backup-YYYY-MM-DD.json`
**Example**: `node dev/backup-data.js ./my-backup.json`

### Production Environment

All production scripts have the same interface as development scripts but include **WARNING** messages to prevent accidental operations.

#### Create User (Production)
```bash
node prod/create-user.js <email> <password> [role]
```
⚠️ **WARNING**: This will create a user in PRODUCTION!

#### Assign Role (Production)
```bash
node prod/assign-role.js <userId> <role>
```
⚠️ **WARNING**: This will modify a user in PRODUCTION!

#### Import Data (Production)
```bash
node prod/import-data.js <type>
```
⚠️ **WARNING**: This will import data to PRODUCTION!

#### Delete User (Production)
```bash
node prod/delete-user.js <userId>
```
⚠️ **WARNING**: This will delete a user from PRODUCTION!

#### List Users (Production)
```bash
node prod/list-users.js
```
Safe read-only operation.

#### Backup Data (Production)
```bash
node prod/backup-data.js [outputPath]
```
**Default**: `./backups/prod-backup-YYYY-MM-DD.json`
⚠️ **WARNING**: This will backup data from PRODUCTION!

## 📊 Features

### Selective Data Import
- Import specific data types: `activities`, `blog`, `categories`, `about`
- Import all data: `all`
- Automatically imports both English and Serbian versions

### User Management
- Create users with roles from the `UserRole` enum
- Assign/change user roles
- Delete users (removes from Auth + Firestore + Subscriptions)
- List users with detailed information

### Data Backup
- Backup all Firestore collections
- Includes metadata and timestamps
- Automatic backup directory creation

### Environment Separation
- Clear separation between dev and prod environments
- Production scripts include warning messages
- Different service account keys for each environment

### Validation
- Role validation against `UserRole` enum
- Import type validation
- Comprehensive error handling

## 🔒 Security

- Uses service account authentication
- No hardcoded credentials
- Production scripts include warnings
- Validates all inputs before execution

## 📝 Output Format

### User List Output
```json
[
  {
    "uid": "abc123",
    "email": "user@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastSignInTime": "2024-01-01T12:00:00.000Z",
    "subscription": {
      "plan": "admin",
      "status": "active"
    },
    "customClaims": {
      "role": "admin",
      "admin": true
    }
  }
]
```

### Backup Output
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "collections": {
    "users": [...],
    "activities_en": [...],
    "activities_sr": [...],
    "blog_en": [...],
    "blog_sr": [...],
    "categories_en": [...],
    "categories_sr": [...],
    "about_en": [...],
    "about_sr": [...],
    "subscriptions": [...],
    "metadata": [...]
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Service Account Key Not Found**
   - Ensure `serviceAccountKey-dev.json` and `serviceAccountKey-prod.json` exist
   - Check file permissions

2. **JSON Files Not Found**
   - Ensure all JSON files exist in `src/assets/`
   - Check file paths and permissions

3. **Permission Errors**
   - Verify service account has necessary permissions
   - Check Firebase project configuration

4. **Import Errors**
   - Validate JSON file format
   - Check collection names and document IDs

### Error Messages
- ❌ **Error**: Operation failed
- ⚠️ **Warning**: Production operation warning
- ✅ **Success**: Operation completed successfully
- 📊 **Info**: General information

## 🔄 Migration from Old Scripts

The old scripts have been replaced with this new structure. Key improvements:

1. **Environment Separation**: Clear dev/prod distinction
2. **Shared Utilities**: Common code in `shared/` directory
3. **Better Validation**: Input validation and error handling
4. **Selective Import**: Import specific data types
5. **Comprehensive Backup**: Backup all collections
6. **Production Warnings**: Safety warnings for production operations

## 📞 Support

For issues or questions about these scripts, check:
1. Service account key configuration
2. JSON file format and location
3. Firebase project permissions
4. Network connectivity 