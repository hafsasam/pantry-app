--1 Recipes that take less than or equal to 30 minutes in total, fastest first.
SELECT *, COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0) AS total_minutes
FROM recipes
WHERE COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0) <= 30
ORDER BY total_minutes ASC;

--2 Show one recipe with all its ingredients: ingredient name, quantity and unit." Pick the chocolate oats.
SELECT i.name, ri.quantity, ri.unit
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats';

--3 "Which ingredients does the Baked Berry & Pecan Oatmeal need that I don't have?", meaning not in the pantry at all, or in the pantry with quantity 0.
SELECT i.name, pi.quantity
FROM recipe_ingredients ri
LEFT JOIN pantry_items pi ON ri.ingredient_id = pi.ingredient_id
JOIN recipes r ON r.id = ri.recipe_id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE r.name = 'Baked Berry & Pecan Oatmeal' AND (pi.quantity IS NULL OR pi.quantity = 0);

--4 "How many ingredients does each recipe have?", one row per recipe, most ingredients first.
SELECT r.name, count(ri.id) AS ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
GROUP BY r.id
ORDER BY ingredient_count DESC;

--5 "Recipes with more than 8 ingredients."
SELECT r.name, count(ri.id) AS ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
GROUP BY r.id
HAVING count(ri.id) > 8
ORDER BY ingredient_count DESC;

--6 "Which recipes use at least one ingredient that needs restocking?"
SELECT DISTINCT r.name
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
WHERE ri.ingredient_id IN (
  SELECT ingredient_id FROM pantry_items WHERE needs_restocking
);

--7 "Which recipes can I cook right now?"
WITH missing_counts AS (
  SELECT r.id, r.name,
         count(*) FILTER (WHERE pi.quantity IS NULL OR pi.quantity = 0) AS missing
  FROM recipes r
  JOIN recipe_ingredients ri ON ri.recipe_id = r.id
  LEFT JOIN pantry_items pi ON ri.ingredient_id = pi.ingredient_id
  GROUP BY r.id
)
SELECT name
FROM missing_counts
WHERE missing = 0;

--8 get steps for the baked oatmeal recipe in order
SELECT position, text FROM recipe_steps rs
JOIN recipes r on r.id = rs.recipe_id
WHERE r.name = 'Baked Berry & Pecan Oatmeal'
ORDER BY position ASC;

--9 "Which ingredients are used by the most recipes?" Show the ingredient name and the number of recipes, most-used first
SELECT i.name, count(*) as ri_count
FROM recipe_ingredients ri
JOIN ingredients i on ri.ingredient_id = i.id
GROUP BY i.id
ORDER BY ri_count DESC, i.name ASC;

--10 "The total shopping list across all recipes: every ingredient that at least one recipe needs,
-- but that's not in the pantry or at quantity 0, each one once, alphabetically."
SELECT DISTINCT i.name
FROM recipe_ingredients ri
LEFT JOIN pantry_items pi ON ri.ingredient_id = pi.ingredient_id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE pi.quantity IS NULL OR pi.quantity = 0
ORDER BY i.name ASC;

--11 "Which items in my pantry (user 1) aren't used by any recipe? Name and quantity, alphabetically."
--1. with LEFT JOIN + IS NULL
--2. with NOT EXISTS (…)
SELECT i.name, pi.quantity
FROM  pantry_items pi
LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = pi.ingredient_id
JOIN ingredients i ON i.id = pi.ingredient_id
WHERE ri.ingredient_id IS NULL AND pi.user_id = 1
ORDER BY i.name ASC;

SELECT i.name, pi.quantity
FROM pantry_items pi
JOIN ingredients i ON i.id = pi.ingredient_id
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri WHERE ri.ingredient_id = pi.ingredient_id
) AND pi.user_id = 1
ORDER BY i.name ASC;
