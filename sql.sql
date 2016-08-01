TRUNCATE TABLE twitter_user;
TRUNCATE TABLE twitter_hashtag;
TRUNCATE TABLE twitter_mention;

DROP TABLE twitter_user;
DROP TABLE twitter_hashtag;
DROP TABLE twitter_mention;


CREATE TABLE "twitter_user" (
  "id" BIGINT PRIMARY KEY,
  "screen_name" varchar(255) NOT NULL,
  "statuses_count" integer NOT NULL,
  "listed_count" integer NOT NULL,
  "followers_count" integer NOT NULL,
  "favourites_count" integer NOT NULL,
  "created_at" varchar(255) NOT NULL,
  "tweet" varchar(255) NOT NULL
) ;

CREATE TABLE "twitter_hashtag" (
  "id" BIGINT,
  "hashtag" varchar(255),
  "created_at" varchar(255) NOT NULL,
   PRIMARY KEY ("id", "hashtag")
) ;

CREATE TABLE "twitter_mention" (
  "id" BIGINT,
  "mention" varchar(255),
  "created_at" varchar(255) NOT NULL,
   PRIMARY KEY ("id", "mention")
) ;

CREATE TABLE "twitter_url" (
  "id" BIGINT,
  "url" varchar(255),
  "created_at" varchar(255) NOT NULL,
   PRIMARY KEY ("id", "url")
) ;


CREATE OR REPLACE FUNCTION insertOrDetectDupliate(BIGINT, varchar, integer, integer, integer, integer, varchar, varchar)
RETURNS integer AS $isPresent$
declare
	isPresent integer;
BEGIN
   SELECT count(*) into isPresent FROM twitter_user WHERE id = $1;
   IF isPresent <> 1 THEN
    INSERT INTO twitter_user (id, screen_name, statuses_count, listed_count, followers_count, favourites_count, created_at, tweet) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
END IF;
   RETURN isPresent;
END;
$isPresent$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insertHashtagNoDuplicate(BIGINT, varchar, varchar)
RETURNS integer AS $isPresent$
declare
	isPresent integer;
BEGIN
   SELECT count(*) into isPresent FROM twitter_hashtag WHERE id = $1 AND hashtag = lower($2);
   IF isPresent = 0 THEN
    INSERT INTO twitter_hashtag (id, hashtag, created_at) VALUES ($1, lower($2), $3);
END IF;
   RETURN isPresent;
END;
$isPresent$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insertMentionNoDuplicate(BIGINT, varchar, varchar)
RETURNS integer AS $isPresent$
declare
	isPresent integer;
BEGIN
   SELECT count(*) into isPresent FROM twitter_mention WHERE id = $1 AND mention = lower($2);
   IF isPresent = 0 THEN
    INSERT INTO twitter_mention (id, mention, created_at) VALUES ($1, lower($2), $3);
END IF;
   RETURN isPresent;
END;
$isPresent$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insertUrlNoDuplicate(BIGINT, varchar, varchar)
RETURNS integer AS $isPresent$
declare
	isPresent integer;
BEGIN
   SELECT count(*) into isPresent FROM twitter_url WHERE id = $1 AND url = lower($2);
   IF isPresent = 0 THEN
    INSERT INTO twitter_url (id, url, created_at) VALUES ($1, lower($2), $3);
END IF;
   RETURN isPresent;
END;
$isPresent$ LANGUAGE plpgsql;
