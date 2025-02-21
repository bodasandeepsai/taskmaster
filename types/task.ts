export interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    createdBy: {
      _id: string;
      username: string;
      email: string;
    };
    assignee?: {
      _id: string;
      username: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  