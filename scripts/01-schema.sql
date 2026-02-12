-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'editor',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, user_id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document sharing table
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(50) DEFAULT 'view',
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);

-- Create document activity table
CREATE TABLE IF NOT EXISTS document_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50),
  cursor_position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for workspaces table
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Only owners can delete workspaces" ON workspaces
  FOR DELETE USING (owner_id = auth.uid()::uuid);

-- Create policies for workspace_members table
CREATE POLICY "Members can view workspace members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND (
        workspaces.owner_id = auth.uid()::uuid OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = workspaces.id
          AND wm.user_id = auth.uid()::uuid
        )
      )
    )
  );

-- Create policies for documents table
CREATE POLICY "Users can view documents in their workspaces" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = documents.workspace_id
      AND (
        workspaces.owner_id = auth.uid()::uuid OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = auth.uid()::uuid
        )
      )
    )
  );

CREATE POLICY "Users can insert documents in their workspaces" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = documents.workspace_id
      AND (
        workspaces.owner_id = auth.uid()::uuid OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = auth.uid()::uuid
        )
      )
    )
  );

CREATE POLICY "Users can update documents in their workspaces" ON documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = documents.workspace_id
      AND (
        workspaces.owner_id = auth.uid()::uuid OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = auth.uid()::uuid
        )
      )
    )
  );

-- Create indices for better performance
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_documents_workspace_id ON documents(workspace_id);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_document_activity_document_id ON document_activity(document_id);
