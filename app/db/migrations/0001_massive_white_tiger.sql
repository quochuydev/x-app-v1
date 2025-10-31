CREATE TABLE "klines" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"interval" varchar(10) NOT NULL,
	"open_time" timestamp NOT NULL,
	"close_time" timestamp NOT NULL,
	"open_price" numeric(20, 8) NOT NULL,
	"high_price" numeric(20, 8) NOT NULL,
	"low_price" numeric(20, 8) NOT NULL,
	"close_price" numeric(20, 8) NOT NULL,
	"volume" numeric(20, 8) NOT NULL,
	"quote_asset_volume" numeric(20, 8) NOT NULL,
	"taker_buy_base_asset_volume" numeric(20, 8) NOT NULL,
	"taker_buy_quote_asset_volume" numeric(20, 8) NOT NULL,
	"trades" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
