DROP TABLE twitter_user;

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
