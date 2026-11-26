import { prisma } from "../src/prisma";
import * as argon2 from "argon2";

const user = { connect: { email: "hafsa@me.com" } };

await prisma.pantryItem.deleteMany();
await prisma.recipeIngredient.deleteMany();
await prisma.recipeStep.deleteMany();
await prisma.recipe.deleteMany();
await prisma.ingredient.deleteMany();
await prisma.user.deleteMany();

await prisma.user.create({
  data: {
    email: "hafsa@me.com",
    password_hash: await argon2.hash("correct horse battery"),
    role: "ADMIN",
  },
});

await prisma.recipe.create({
  data: {
    name: "Chocolate Peanut Butter Overnight Oats",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    recipeSteps: {
      create: [
        {
          position: 1,
          text: "In a medium bowl, combine all the ingredients and mix well.",
        },
        {
          position: 2,
          text: "Optionally, spoon a little peanut butter into the jars and swirl it around the inside.",
        },
        {
          position: 3,
          text: "Divide the oat mixture between the jars, cover, and refrigerate overnight.",
        },
        {
          position: 4,
          text: "In the morning, add your desired toppings, and enjoy!",
        },
      ],
    },
    recipeIngredients: {
      create: [
        {
          quantity: 46,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "rolled oats" },
              create: { name: "rolled oats" },
            },
          },
        },
        {
          quantity: 120,
          unit: "ml",
          ingredient: {
            connectOrCreate: {
              where: { name: "unsweetened soy milk" },
              create: { name: "unsweetened soy milk" },
            },
          },
        },
        {
          quantity: 65,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "unsweetened soy yogurt" },
              create: { name: "unsweetened soy yogurt" },
            },
          },
        },
        {
          quantity: 24,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "natural peanut butter" },
              create: { name: "natural peanut butter" },
            },
          },
        },
        {
          quantity: 6,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "dutch-processed cocoa powder" },
              create: { name: "dutch-processed cocoa powder" },
            },
          },
        },
        {
          quantity: 10,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "dairy-free dark chocolate" },
              create: { name: "dairy-free dark chocolate" },
            },
          },
        },
        {
          quantity: 23,
          unit: "ml",
          ingredient: {
            connectOrCreate: {
              where: { name: "maple syrup" },
              create: { name: "maple syrup" },
            },
          },
        },
        {
          quantity: 5,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "whole chia seeds" },
              create: { name: "whole chia seeds" },
            },
          },
        },
        {
          quantity: 1,
          unit: "pinch",
          ingredient: {
            connectOrCreate: {
              where: { name: "salt" },
              create: { name: "salt" },
            },
          },
        },
      ],
    },
  },
});

await prisma.recipe.create({
  data: {
    name: "Peanut Butter & Jelly Overnight Oats",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    recipeSteps: {
      create: [
        {
          position: 1,
          text: "Add the oats, milk, peanut butter, chia seeds, and cinnamon to a mason jar or airtight container. Mix to combine.",
        },
        {
          position: 2,
          text: "Then add the frozen berries, and gently mix again. Seal and let sit overnight in the fridge.",
        },
        {
          position: 3,
          text: "The next morning, add your desired toppings and enjoy!",
        },
      ],
    },
    recipeIngredients: {
      create: [
        {
          quantity: 46,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "rolled oats" },
              create: { name: "rolled oats" },
            },
          },
        },
        {
          quantity: 32,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "natural peanut butter" },
              create: { name: "natural peanut butter" },
            },
          },
        },
        {
          quantity: 11,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "whole chia seeds" },
              create: { name: "whole chia seeds" },
            },
          },
        },
        {
          quantity: 0.25,
          unit: "tsp",
          ingredient: {
            connectOrCreate: {
              where: { name: "ground cinnamon" },
              create: { name: "ground cinnamon" },
            },
          },
        },
        {
          quantity: 65,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "frozen mixed berries" },
              create: { name: "frozen mixed berries" },
            },
          },
        },
        {
          quantity: 120,
          unit: "ml",
          ingredient: {
            connectOrCreate: {
              where: { name: "unsweetened soy milk" },
              create: { name: "unsweetened soy milk" },
            },
          },
        },
      ],
    },
  },
});

await prisma.recipe.create({
  data: {
    name: "Baked Berry & Pecan Oatmeal",
    prep_time_minutes: 10,
    cook_time_minutes: 40,
    recipeSteps: {
      create: [
        {
          position: 1,
          text: "Lightly grease a 9 x 12 inch (23 x 31 cm) baking dish and preheat the oven to 350°F (180°C).",
        },
        {
          position: 2,
          text: "Add the flaxseeds and water to a large bowl. Mix and let rest for 5 minutes to gel.",
        },
        {
          position: 3,
          text: "Add the bananas to the bowl and mash well. Then add the milk and vanilla, and stir to combine.",
        },
        {
          position: 4,
          text: "Add the oats, cinnamon, baking powder, salt, and pecans. Mix to combine.",
        },
        {
          position: 5,
          text: "Gently fold in the blueberries and strawberries.",
        },
        {
          position: 6,
          text: "Pour the mixture into the baking dish. If desired, decorate the top with more berries and pecans. Bake on the centre rack for 35 to 40 minutes, or until firm and lightly golden.",
        },
        {
          position: 7,
          text: "Allow the oatmeal to cool for a few minutes before slicing. Add desired toppings, such as yogurt and nut butter, and enjoy!",
        },
      ],
    },
    recipeIngredients: {
      create: [
        {
          quantity: 7,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "ground flaxseeds" },
              create: { name: "ground flaxseeds" },
            },
          },
        },
        {
          quantity: 45,
          unit: "ml",
          ingredient: {
            connectOrCreate: {
              where: { name: "water" },
              create: { name: "water" },
            },
          },
        },
        {
          quantity: 2,
          unit: "whole",
          ingredient: {
            connectOrCreate: {
              where: { name: "ripe bananas" },
              create: { name: "ripe bananas" },
            },
          },
        },
        {
          quantity: 360,
          unit: "ml",
          ingredient: {
            connectOrCreate: {
              where: { name: "unsweetened soy milk" },
              create: { name: "unsweetened soy milk" },
            },
          },
        },
        {
          quantity: 5,
          unit: "ml",
          ingredient: {
            connectOrCreate: {
              where: { name: "pure vanilla extract" },
              create: { name: "pure vanilla extract" },
            },
          },
        },
        {
          quantity: 185,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "rolled oats" },
              create: { name: "rolled oats" },
            },
          },
        },
        {
          quantity: 5,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "ground cinnamon" },
              create: { name: "ground cinnamon" },
            },
          },
        },
        {
          quantity: 4.5,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "baking powder" },
              create: { name: "baking powder" },
            },
          },
        },
        {
          quantity: 0.5,
          unit: "tsp",
          ingredient: {
            connectOrCreate: {
              where: { name: "salt" },
              create: { name: "salt" },
            },
          },
        },
        {
          quantity: 37,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "unsalted roasted pecans" },
              create: { name: "unsalted roasted pecans" },
            },
          },
        },
        {
          quantity: 115,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "fresh blueberries" },
              create: { name: "fresh blueberries" },
            },
          },
        },
        {
          quantity: 110,
          unit: "g",
          ingredient: {
            connectOrCreate: {
              where: { name: "fresh strawberries" },
              create: { name: "fresh strawberries" },
            },
          },
        },
      ],
    },
  },
});

await prisma.recipe.create({
  data: {
    name: "Vegan 'Nutella' Overnight Oats",
    prep_time_minutes: null,
    cook_time_minutes: null,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 500,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "rolled oats" },
        create: { name: "rolled oats" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 1000,
    unit: "ml",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "unsweetened soy milk" },
        create: { name: "unsweetened soy milk" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 250,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "unsweetened soy yogurt" },
        create: { name: "unsweetened soy yogurt" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 300,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "natural peanut butter" },
        create: { name: "natural peanut butter" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 100,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "dutch-processed cocoa powder" },
        create: { name: "dutch-processed cocoa powder" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 100,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "dairy-free dark chocolate" },
        create: { name: "dairy-free dark chocolate" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 250,
    unit: "ml",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "maple syrup" },
        create: { name: "maple syrup" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 100,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "whole chia seeds" },
        create: { name: "whole chia seeds" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 100,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "salt" },
        create: { name: "salt" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 50,
    unit: "g",
    needs_restocking: false,
    ingredient: {
      connectOrCreate: {
        where: { name: "ground cinnamon" },
        create: { name: "ground cinnamon" },
      },
    },
    user,
  },
});

await prisma.pantryItem.create({
  data: {
    quantity: 0,
    unit: "g",
    needs_restocking: true,
    ingredient: {
      connectOrCreate: {
        where: { name: "frozen mixed berries" },
        create: { name: "frozen mixed berries" },
      },
    },
    user,
  },
});

await prisma.$disconnect();
