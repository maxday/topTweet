DROP TABLE twitter_user;

CREATE TABLE "twitter_user" (
  "id" BIGINT PRIMARY KEY,
  "screen_name" varchar(255) NOT NULL,
  "statuses_count" integer NOT NULL,
  "listed_count" integer NOT NULL,
  "followers_count" integer NOT NULL,
  "favourites_count" integer NOT NULL,
  "created_at" varchar(255) NOT NULL
) ;
