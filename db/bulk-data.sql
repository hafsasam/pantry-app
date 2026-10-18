-- generate 100k pantry items and ingredients
INSERT INTO ingredients (name)
SELECT 'ingredient ' || n
FROM generate_series(1, 100000) AS n;

INSERT INTO pantry_items (quantity, unit, needs_restocking, ingredient_id)
SELECT random() * 1000, CASE WHEN random() >= 0.5 THEN 'g' ELSE 'ml' END, random() <= 0.01, i.id
FROM generate_series(1, 100000) AS n
JOIN ingredients i ON i.name = 'ingredient ' || n;
