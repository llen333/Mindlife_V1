-- Add memory_level and emotion columns to vector_memories
ALTER TABLE vector_memories ADD COLUMN IF NOT EXISTS memory_level VARCHAR(10) DEFAULT 'mtm';
ALTER TABLE vector_memories ADD COLUMN IF NOT EXISTS emotion VARCHAR(50);

-- Create index on memory_level for efficient queries
CREATE INDEX IF NOT EXISTS idx_vector_memories_level ON vector_memories(memory_level);
CREATE INDEX IF NOT EXISTS idx_vector_memories_emotion ON vector_memories(emotion);

-- Update existing records with default values
UPDATE vector_memories SET memory_level = 'mtm' WHERE memory_level IS NULL;