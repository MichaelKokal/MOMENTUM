# Momentum Log

A daily progress tracker for workouts, tasks, water and food. Plan your days ahead, check things off as you go, and see your progress over time.

## Features

- **Workouts and daily tasks.** Add them to any day, including future days, and check them off. Mark an item "Every day" to have it show up on each new day automatically.
- **Water.** Tap glasses to fill them in, with an adjustable daily goal (250 ml per glass).
- **Food lookup with real nutrition data.** Search more than 13,000 foods, pick a serving size, and log calories, protein, carbs, sugar, fat, saturated fat, fiber and sodium. You can also enter calories by hand.
- **Daily goals.** Calorie and macro goals start at the FDA Daily Values and can be changed.
- **Fresh page every day.** At midnight the tracker moves to a new day with your daily routine ready to check off.
- **Progress over time.** Charts for checklist completion, water, calories and protein over the last 7, 14 or 30 days, plus your current streak and averages.
- **Animated** progress bars, rings, checkmarks and water glasses (turned off when your system asks for reduced motion).

Everything is saved in your browser's local storage. Nothing is sent to a server.

## Running it

It's a static site with no build step. Serve the folder with any static file server, for example:

```sh
npx serve .
```

Then open the address it prints. Opening `index.html` directly from disk won't load the food database, because browsers block `fetch` on `file://` pages.

It also works as-is on GitHub Pages.

## Nutrition data

Food data comes from [USDA FoodData Central](https://fdc.nal.usda.gov/):

- **SR Legacy** (April 2018): 7,793 foods with lab-analyzed nutrient values.
- **FNDDS survey foods** (October 2024): 5,431 foods as people commonly eat them, from the What We Eat in America dietary survey, with typical serving sizes.

Values are stored per 100 g and scaled to the serving you choose. Each logged food links back to its FoodData Central entry. USDA FoodData Central data is in the public domain (CC0 1.0).

### Rebuilding `data/foods.json`

1. Download the SR Legacy and FNDDS CSV zips from the [FoodData Central download page](https://fdc.nal.usda.gov/download-datasets).
2. Unzip them into `raw/sr/` and `raw/fn/`.
3. Run:

```sh
node scripts/build_foods.js raw data/foods.json
```

## License

MIT
