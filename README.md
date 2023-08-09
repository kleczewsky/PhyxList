# PhyxList!

PhyxList is a to-do list powered by the physics engine [matter.js](https://brm.io/matter-js/).

The engine's renderer is the browser's DOM with help of some clever scaling and translating.

This made it possible to create physical objects mirrored on DOM elements

## Rooms

---

The application was equipped with a system of rooms that the user can create or join.

In this way, the task list can be shared with other users.

## Instructions

---

On the left side there are forms for joining a room, and adding tasks to the list.

The tasks are mapped to the physics engine, so they can be manipulated.

This is done by using the right mouse button in a hold and drop form.

## API

---

In order for the application to work properly, you need a server that exposes the API I prepared in Laravel.

For the purposes of the demo, I use the free services heroku.com and clever-cloud.com
