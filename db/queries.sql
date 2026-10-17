-- Recipes that take less than or equal to 30 minutes in total, fastest first.
SELECT *, COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0) AS total_minutes
FROM recipes
WHERE COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0) <= 30
ORDER BY total_minutes ASC;

-- Show one recipe with all its ingredients: ingredient name, quantity and unit." Pick the chocolate oats.
SELECT i.name, ri.quantity, ri.unit
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats';

--"Which ingredients does the Baked Berry & Pecan Oatmeal need that I don't have?", meaning not in the pantry at all, or in the pantry with quantity 0.
SELECT i.name, pi.quantity
FROM recipe_ingredients ri
LEFT JOIN pantry_items pi ON ri.ingredient_id = pi.ingredient_id
JOIN recipes r ON r.id = ri.recipe_id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE r.name = 'Baked Berry & Pecan Oatmeal' AND (pi.quantity IS NULL OR pi.quantity = 0);

-- "How many ingredients does each recipe have?", one row per recipe, most ingredients first.
SELECT r.name, count(ri.id) AS ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
GROUP BY r.id
ORDER BY ingredient_count DESC;

-- "Recipes with more than 8 ingredients."
SELECT r.name, count(ri.id) AS ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
GROUP BY r.id
HAVING count(ri.id) > 8
ORDER BY ingredient_count DESC;

--"Which recipes use at least one ingredient that needs restocking?"
SELECT DISTINCT r.name
FROM recipes r
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
WHERE ri.ingredient_id IN (
  SELECT ingredient_id FROM pantry_items WHERE needs_restocking
);

-- "Which recipes can I cook right now?"
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

-- get steps for the baked oatmeal recipe in order
SELECT position, text from recipe_steps rs
JOIN recipes r on r.id = rs.recipe_id
WHERE r.name = 'Baked Berry & Pecan Oatmeal'
ORDER BY position ASC;
