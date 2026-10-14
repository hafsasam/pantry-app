DROP TABLE IF EXISTS recipe_ingredients, pantry_items, ingredients, recipe_steps, recipes;
CREATE TABLE recipes(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  prep_time_minutes integer,
  cook_time_minutes integer,
  CHECK (prep_time_minutes >= 0 AND cook_time_minutes >= 0)
);
CREATE TABLE recipe_steps(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id integer NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position int NOT NULL,
  text text NOT NULL,
  UNIQUE (recipe_id, position)
);
CREATE TABLE ingredients(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  UNIQUE (name)
);
CREATE TABLE pantry_items(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ingredient_id integer NOT NULL REFERENCES ingredients(id),
  quantity numeric NOT NULL,
  unit text NOT NULL,
  needs_restocking boolean NOT NULL DEFAULT false,
  CHECK (quantity >= 0),
  UNIQUE(ingredient_id)
);
CREATE TABLE recipe_ingredients(
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ingredient_id integer NOT NULL REFERENCES ingredients(id),
  recipe_id integer NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  CHECK (quantity > 0),
  UNIQUE (recipe_id, ingredient_id)
);
