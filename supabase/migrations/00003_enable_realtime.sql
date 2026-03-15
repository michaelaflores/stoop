-- Enable Supabase Realtime on tables that need live updates
-- This adds the tables to the supabase_realtime publication so
-- postgres_changes events are broadcast to subscribed clients.

ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE alert_responses;
