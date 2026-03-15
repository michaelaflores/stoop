-- Trigger functions to automatically maintain denormalized counts on posts.
-- These run as the table owner (SECURITY DEFINER not needed — triggers bypass RLS by default).

-- ============================================================
-- VOTE COUNT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_post_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vote_count_insert
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION update_post_upvote_count();

CREATE TRIGGER trg_vote_count_delete
  AFTER DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_post_upvote_count();

-- ============================================================
-- COMMENT COUNT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_count_insert
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER trg_comment_count_delete
  AFTER DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ============================================================
-- ALERT RESPONSE COUNT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_post_alert_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.response_type = 'confirm' THEN
      UPDATE posts SET alert_confirmed_count = alert_confirmed_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.response_type = 'dismiss' THEN
      UPDATE posts SET alert_dismissed_count = alert_dismissed_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle switching response type (e.g. confirm -> dismiss via upsert)
    IF OLD.response_type = 'confirm' AND NEW.response_type = 'dismiss' THEN
      UPDATE posts SET
        alert_confirmed_count = GREATEST(alert_confirmed_count - 1, 0),
        alert_dismissed_count = alert_dismissed_count + 1
      WHERE id = NEW.post_id;
    ELSIF OLD.response_type = 'dismiss' AND NEW.response_type = 'confirm' THEN
      UPDATE posts SET
        alert_dismissed_count = GREATEST(alert_dismissed_count - 1, 0),
        alert_confirmed_count = alert_confirmed_count + 1
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.response_type = 'confirm' THEN
      UPDATE posts SET alert_confirmed_count = GREATEST(alert_confirmed_count - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.response_type = 'dismiss' THEN
      UPDATE posts SET alert_dismissed_count = GREATEST(alert_dismissed_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_alert_response_insert
  AFTER INSERT ON alert_responses
  FOR EACH ROW EXECUTE FUNCTION update_post_alert_counts();

CREATE TRIGGER trg_alert_response_update
  AFTER UPDATE ON alert_responses
  FOR EACH ROW EXECUTE FUNCTION update_post_alert_counts();

CREATE TRIGGER trg_alert_response_delete
  AFTER DELETE ON alert_responses
  FOR EACH ROW EXECUTE FUNCTION update_post_alert_counts();
