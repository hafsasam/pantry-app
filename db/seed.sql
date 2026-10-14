INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes) VALUES ('Chocolate Peanut Butter Overnight Oats', 5, 0);
INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes) VALUES ('Peanut Butter & Jelly Overnight Oats', 5, 0);
INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes) VALUES ('Vegan ''Nutella'' Overnight Oats', NULL, NULL);

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 1, 'In a medium bowl, combine all the ingredients and mix well.'
FROM recipes r
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats';

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 2, 'Optionally, spoon a little peanut butter into the jars and swirl it around the inside.'
FROM recipes r
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats';

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 3, 'Divide the oat mixture between the jars, cover, and refrigerate overnight.'
FROM recipes r
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats';

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 4, 'In the morning, add your desired toppings, and enjoy!'
FROM recipes r
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats';


INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 1, 'Add the oats, milk, peanut butter, chia seeds, and cinnamon to a mason jar or airtight container. Mix to combine.'
FROM recipes r
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats';

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 2, 'Then add the frozen berries, and gently mix again. Seal and let sit overnight in the fridge.'
FROM recipes r
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats';

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, 3, 'The next morning, add your desired toppings and enjoy!'
FROM recipes r
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats';

INSERT INTO ingredients (name) VALUES
('rolled oats'),
('unsweetened soy milk'),
('unsweetened soy yogurt'),
('natural peanut butter'),
('dutch-processed cocoa powder'),
('dairy-free dark chocolate'),
('maple syrup'),
('whole chia seeds'),
('pure vanilla extract'),
('salt'),
('ground cinnamon'),
('frozen mixed berries'),
('ground flaxseeds'),
('water'),
('ripe bananas'),
('baking powder'),
('unsalted roasted pecans'),
('fresh blueberries'),
('fresh strawberries');

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 46, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'rolled oats';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 120, 'ml'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'unsweetened soy milk';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 65, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'unsweetened soy yogurt';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 24, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'natural peanut butter';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 6, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'dutch-processed cocoa powder';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 10, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'dairy-free dark chocolate';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 23, 'ml'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'maple syrup';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 5, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'whole chia seeds';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 1, 'pinch'
FROM recipes r, ingredients i
WHERE r.name = 'Chocolate Peanut Butter Overnight Oats' AND i.name = 'salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 46, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats' AND i.name = 'rolled oats';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 120, 'ml'
FROM recipes r, ingredients i
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats' AND i.name = 'unsweetened soy milk';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 32, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats' AND i.name = 'natural peanut butter';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 11, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats' AND i.name = 'whole chia seeds';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 0.25, 'tsp'
FROM recipes r, ingredients i
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats' AND i.name = 'ground cinnamon';
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, 65, 'g'
FROM recipes r, ingredients i
WHERE r.name = 'Peanut Butter & Jelly Overnight Oats' AND i.name = 'frozen mixed berries';

INSERT INTO pantry_items (ingredient_id, quantity, unit, needs_restocking)
SELECT i.id, p.quantity, p.unit, p.needs_restocking
FROM ingredients i
JOIN (VALUES
    ('rolled oats', 500, 'g', false),
    ('unsweetened soy milk', 1000, 'ml', false),
    ('unsweetened soy yogurt', 250, 'g', false),
    ('natural peanut butter', 300, 'g', false),
    ('dutch-processed cocoa powder', 100, 'g', false),
    ('dairy-free dark chocolate', 100, 'g', false),
    ('maple syrup', 250, 'ml', false),
    ('whole chia seeds', 100, 'g', false),
    ('salt', 100, 'g', false),
    ('ground cinnamon', 50, 'g', false),
    ('frozen mixed berries', 0, 'g', true)
) AS p(name, quantity, unit, needs_restocking) ON p.name = i.name;

INSERT INTO recipes (name, prep_time_minutes, cook_time_minutes)
VALUES ('Baked Berry & Pecan Oatmeal', 10, 40);

INSERT INTO recipe_steps (recipe_id, position, text)
SELECT r.id, s.position, s.text
FROM recipes r
JOIN (VALUES
    (1, 'Lightly grease a 9 x 12 inch (23 x 31 cm) baking dish and preheat the oven to 350°F (180°C).'),
    (2, 'Add the flaxseeds and water to a large bowl. Mix and let rest for 5 minutes to gel.'),
    (3, 'Add the bananas to the bowl and mash well. Then add the milk and vanilla, and stir to combine.'),
    (4, 'Add the oats, cinnamon, baking powder, salt, and pecans. Mix to combine.'),
    (5, 'Gently fold in the blueberries and strawberries.'),
    (6, 'Pour the mixture into the baking dish. If desired, decorate the top with more berries and pecans. Bake on the centre rack for 35 to 40 minutes, or until firm and lightly golden.'),
    (7, 'Allow the oatmeal to cool for a few minutes before slicing. Add desired toppings, such as yogurt and nut butter, and enjoy!')
) AS s(position, text) ON true
WHERE r.name = 'Baked Berry & Pecan Oatmeal';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT r.id, i.id, ri.quantity, ri.unit
FROM recipes r
JOIN (VALUES
    ('ground flaxseeds', 7, 'g'),
    ('water', 45, 'ml'),
    ('ripe bananas', 2, 'whole'),
    ('unsweetened soy milk', 360, 'ml'),
    ('pure vanilla extract', 5, 'ml'),
    ('rolled oats', 185, 'g'),
    ('ground cinnamon', 5, 'g'),
    ('baking powder', 4.5, 'g'),
    ('salt', 0.5, 'tsp'),
    ('unsalted roasted pecans', 37, 'g'),
    ('fresh blueberries', 115, 'g'),
    ('fresh strawberries', 110, 'g')
) AS ri(name, quantity, unit) ON true
JOIN ingredients i ON i.name = ri.name
WHERE r.name = 'Baked Berry & Pecan Oatmeal';
