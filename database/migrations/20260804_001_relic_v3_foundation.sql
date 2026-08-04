-- Relic v3 relational foundation.
-- Prerequisites: the existing Data Connect/Postgres `user_account` and `story`
-- tables. This migration creates no UI, generator, evaluator, or verifier.

BEGIN;

CREATE TABLE relic_achievement_template (
  id UUID PRIMARY KEY,
  schema_version SMALLINT NOT NULL DEFAULT 3 CHECK (schema_version = 3),
  achievement_key TEXT NOT NULL UNIQUE,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'retired')),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  description TEXT NOT NULL CHECK (length(btrim(description)) > 0),
  rarity TEXT NOT NULL CHECK (
    rarity IN ('Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Transcendent')
  ),
  condition_evaluator_key TEXT NOT NULL CHECK (length(btrim(condition_evaluator_key)) > 0),
  condition_evaluator_version INTEGER NOT NULL CHECK (condition_evaluator_version > 0),
  condition_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  condition_parameters JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(condition_parameters) = 'object'),
  title_reward JSONB
    CHECK (title_reward IS NULL OR jsonb_typeof(title_reward) = 'object'),
  qi_reward SMALLINT NOT NULL DEFAULT 0 CHECK (qi_reward BETWEEN 0 AND 250),
  cosmetic_rewards JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(cosmetic_rewards) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE story_relic_assignment (
  id UUID PRIMARY KEY,
  schema_version SMALLINT NOT NULL DEFAULT 3 CHECK (schema_version = 3),
  owner_uid TEXT NOT NULL REFERENCES user_account(uid) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  achievement_template_id UUID NOT NULL REFERENCES relic_achievement_template(id),
  template_version INTEGER NOT NULL CHECK (template_version > 0),

  -- Immutable assignment snapshot. Template edits only affect future stories.
  achievement_key_snapshot TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  description_snapshot TEXT NOT NULL,
  rarity_snapshot TEXT NOT NULL CHECK (
    rarity_snapshot IN ('Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Transcendent')
  ),
  condition_evaluator_key_snapshot TEXT NOT NULL,
  condition_evaluator_version_snapshot INTEGER NOT NULL
    CHECK (condition_evaluator_version_snapshot > 0),
  condition_hidden_snapshot BOOLEAN NOT NULL DEFAULT FALSE,
  condition_parameters_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(condition_parameters_snapshot) = 'object'),
  title_reward_snapshot JSONB
    CHECK (title_reward_snapshot IS NULL OR jsonb_typeof(title_reward_snapshot) = 'object'),
  qi_reward_snapshot SMALLINT NOT NULL DEFAULT 0 CHECK (qi_reward_snapshot BETWEEN 0 AND 250),
  cosmetic_rewards_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(cosmetic_rewards_snapshot) = 'array'),

  status TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'in_progress', 'earned', 'disabled')),
  progress_current BIGINT NOT NULL DEFAULT 0 CHECK (progress_current >= 0),
  progress_target BIGINT NOT NULL DEFAULT 1 CHECK (progress_target > 0),
  progress_unit TEXT,
  progress_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(progress_metadata) = 'object'),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  earned_at TIMESTAMPTZ,

  CONSTRAINT story_relic_progress_within_target
    CHECK (progress_current <= progress_target),
  CONSTRAINT story_relic_earned_state_consistent
    CHECK ((status = 'earned') = (earned_at IS NOT NULL)),
  CONSTRAINT story_relic_one_assignment_per_achievement
    UNIQUE (story_id, achievement_template_id),
  CONSTRAINT story_relic_assignment_scope_key
    UNIQUE (id, owner_uid, story_id, achievement_template_id)
);

CREATE INDEX story_relic_assignment_owner_story_idx
  ON story_relic_assignment (owner_uid, story_id, status);

CREATE TABLE earned_relic (
  id UUID PRIMARY KEY,
  schema_version SMALLINT NOT NULL DEFAULT 3 CHECK (schema_version = 3),
  owner_uid TEXT NOT NULL REFERENCES user_account(uid) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES story(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL,
  achievement_template_id UUID NOT NULL REFERENCES relic_achievement_template(id),
  achievement_snapshot JSONB NOT NULL
    CHECK (jsonb_typeof(achievement_snapshot) = 'object'),
  completion_evidence JSONB NOT NULL
    CHECK (
      jsonb_typeof(completion_evidence) = 'array'
      AND jsonb_array_length(completion_evidence) > 0
    ),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT earned_relic_assignment_scope_fk
    FOREIGN KEY (assignment_id, owner_uid, story_id, achievement_template_id)
    REFERENCES story_relic_assignment (id, owner_uid, story_id, achievement_template_id)
    ON DELETE CASCADE,
  CONSTRAINT earned_relic_one_per_assignment UNIQUE (assignment_id),
  -- Final race-safe rule: one earning for an achievement in a story, even if
  -- two workers evaluate completion at the same time.
  CONSTRAINT earned_relic_one_per_achievement_per_story
    UNIQUE (story_id, achievement_template_id)
);

CREATE INDEX earned_relic_owner_story_idx
  ON earned_relic (owner_uid, story_id, earned_at DESC);

-- Prevent an authenticated owner identifier from being paired with another
-- account's story. Earned rows inherit the same scope through their composite FK.
CREATE FUNCTION relic_v3_assert_story_owner() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM story
    WHERE story.id = NEW.story_id
      AND story.owner_uid = NEW.owner_uid
  ) THEN
    RAISE EXCEPTION 'Relic assignment owner does not own story %', NEW.story_id
      USING ERRCODE = '23503';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER story_relic_assignment_owner_guard
BEFORE INSERT OR UPDATE OF owner_uid, story_id ON story_relic_assignment
FOR EACH ROW EXECUTE FUNCTION relic_v3_assert_story_owner();

COMMIT;
