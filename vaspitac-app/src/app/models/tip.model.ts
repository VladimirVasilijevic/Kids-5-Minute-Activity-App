/**
 * Represents a parenting tip or advice
 */
export interface Tip {
  /** Unique identifier for the tip */
  id: number;
  /** Title of the tip */
  title: string;
  /** Description/content of the tip */
  description: string;
  /** Icon name for the tip */
  icon: string;
  /** CSS color class for styling */
  color: string;
}
