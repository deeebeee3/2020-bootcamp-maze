const { Engine, Render, Runner, World, Bodies, Body } = Matter;

const cells = 15;
const width = 600;
const height = 600;

const unitLength = width / cells;

const engine = Engine.create();

engine.world.gravity.y = 0;

const { world } = engine;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width,
    height,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];

World.add(world, walls);

// Maze generation

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

//old way maze generation
// const grid = [];
// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     grid[i].push(false);
//   }
// }

//new way maze generation
const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
  //if i have visited the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  //mark this cell as being visited
  grid[row][column] = true;

  //assemble randomly-ordered list of neighbours
  const neighbours = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  //for each neighbour.....
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;

    //see if that neighbour is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }

    //if we have visited that neighbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //remove a wall from either horiontals or verticals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if(open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      10,
      {
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if(open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      10,
      unitLength,
      {
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

//Goal
const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * .7,
  unitLength * .7,
  {
    isStatic : true
  }
);
World.add(world, goal);

//Ball
const ball = Bodies.circle(
  unitLength / 2,
  unitLength / 2,
  unitLength / 4
);
World.add(world, ball);

document.addEventListener('keydown', event => {
  const {x,y} = ball.velocity;
  console.log(x, y);

  if(event.keyCode === 87){
    Body.setVelocity(ball, {x: x, y: y -5 });
  }
  if(event.keyCode === 68){
    Body.setVelocity(ball, {x: x + 5, y: y });
  }
  if(event.keyCode === 83){
    Body.setVelocity(ball, {x: x , y: y + 5 });
  }
  if(event.keyCode === 65){
    Body.setVelocity(ball, {x: x - 5 , y: y });
  }
});