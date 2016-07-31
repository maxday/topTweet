DROP TABLE twitter_user;
DROP SEQUENCE user_pk;
CREATE SEQUENCE user_pk;

CREATE TABLE "twitter_user" (
  "pk_id" int PRIMARY KEY default nextval('user_pk'),
  "screen_name" varchar(255) NOT NULL,
  "statuses_count" integer NOT NULL,
  "listed_count" integer NOT NULL,
  "followers_count" integer NOT NULL,
  "favourites_count" integer NOT NULL,
  "created_at" varchar(255) NOT NULL
) ;
