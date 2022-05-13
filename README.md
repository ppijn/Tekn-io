# Tekn.io README

## Table of Content 

- [Introduction to concept](#introduction-to-concept)
- [MoSCoW wish-list](#moscow-wish-list)
- [How does it work](#how-does-it-work)
- [About the API](#about-the-api)
- [Data Lifecycle Diagram](#data-lifecycle-diagram)
- [Realtime Events](#realtime-socket-events)

 ## Introduction to concept❔

For this course Real Time Web, we had to create some sort of multi users website that updates in real time. Events that you do or send to the server will therefore be send directly to the other clients as well. So with this in mind, I really wanted to create my version of Scribbl.io. Scribble io is a website where one person gets to draw a word while the others guess and can win when they guess correct. In my mind this was already way more then I can chew but i like a challenge. 

This was my first concept sketch and after this quick sketch I went into coding directly.


## MoSCoW wish-list✅

### Must have
- [x] Canvas for someone to draw on
- [x] Login page for client to create username
- [x] Chat for people to guess in
- [x] See username next to chat
- [x] Have random word generated from my own API
- [x] Have different roles
- [x] Have a winning screen when someone guessed correct
- [x] Start new game button
- [x] Look visually pleasing 

### Should have
- [x] User list (updated)
- [ ] Only one winning message 

### Could have
- [ ] Better drawing experience with socket

### Want to have
- [ ] I have everything I wanted to implemented:)

## How does it work?🤷🏼‍♂️
### Login
Once the client opens the website they get send to index.ejs where they see a username form which they need to fill in to participate. Once the username is filled in, it gets saved into the server using an array and the client gets send to the drawing room. Using the search params we get the username out of the url and this will be shown in the chat when a client chats

### Roles
Once they have joined the room, they will be assigned a role either drawing or guessing. Using this code we get a random user from the array and assign the role drawing to him while the others are automatically guessing.
```
socket.on("newRound", () => {
    // nieuwe speler aanwijzen (random speler uit array)
    while (activePlayer == "" || !users.includes(activePlayer)) {
      activePlayer = users[Math.floor(Math.random() * users.length)];
    }
    io.emit("activePlayer", activePlayer);
    console.log("De actieve speler is: ", activePlayer);

    io.emit("newWord", currentWord);
  });
```

### Draw✏️
If you have the role Drawing, you have access to the canvas, you can see the word you need to draw, you have access to pick a color and decide the stroke width. And you also have the opportunity to start a new game.
 
### Guess
If you are a guesser, you are able to guess in the chat. Thats it basically. You see the drawing and you can chat.

### Win👑
Once guessed correctly using this code: 
```
socket.on("won", (username) => {
  won.style.setProperty("visibility", "visible");
  won.innerHTML += `<img src="./img/crown.png" alt="User has won!" class="crown" /><p>${username} has won!</p>`;
  });
```
```
socket.on("guessText", (guess, guesser) => {
    // matchen!
    if (
      guess.guess.toLowerCase() ===
      wordArray.data[randomWord].word.toLowerCase()
    ) {
      console.log(guess.guesser, "has won!!");
      io.emit("won", guess.guesser);
    }
  });
```
We compare the chat message and its coherent user with the random word that was generated and that will give a win message once the words match completely.

### New Round
Once a game is finished its the drawers role to start a new game. This button is only seen by the drawer. What the button does is it reloads every screen using socket. And because of this the roles get reshuffled and a new word is generated. Without causing any errors.

## About the API
I was searching for a very long time for an API that has random words to draw but I couldn’t find any good ones. I only wanted a few amount of words and the words needed to be drawable easily by everyone. Thats when I decided to create my own API using SupaBase. Supabase lets you create a table where you can put your own information in and it will automatically be generated as an API and supabase will give you an API key too. It was very easy and quite fast to make and it works perfectly. The words were handpicked and are easily to draw and very distinctive making the rounds short and fun. 
The API consists of two columns: ID and Word.

## Data Lifecycle Diagram♼


## Realtime Socket Events🧦

### Message Event

app.js
```
socket.on("message", (message) => {
    io.emit("message", message);
  });
```
Script.js
```
if (chatInput.value) {
    socket.emit("message", { text: chatInput.value, name: username });
    chatInput.value = "";
  }
```

### guessText Event

app.js
```
socket.on("guessText", (guess, guesser) => {
    if (
      guess.guess.toLowerCase() ===
      wordArray.data[randomWord].word.toLowerCase()
    ) {
      console.log(guess.guesser, "has won!!");
      io.emit("won", guess.guesser);
    }
  });
```
Script.js
```
socket.on("won", (username) => {
  won.style.setProperty("visibility", "visible");
  won.innerHTML += `<img src="./img/crown.png" alt="User has won!" class="crown" /><p>${username} has won!</p>`;
});

socket.emit("guessText", { guess: message.text, guesser: message.name });
```

### Disconnect Event

app.js
```
socket.on("disconnect", () => {
    users.splice(users.indexOf(socket.id), 1); // 2nd parameter means remove one item only
  });
```
Script.js

### New Round Event

app.js
```
socket.on("newRound", () => {
    // nieuwe speler aanwijzen (random speler uit array)
    while (activePlayer == "" || !users.includes(activePlayer)) {
      activePlayer = users[Math.floor(Math.random() * users.length)];
    }
    io.emit("activePlayer", activePlayer);
    
    // woord emitten naar alle gebruikers
    io.emit("newWord", currentWord);
  });
```
Script.js

### Drawing Event

app.js
```
socket.on("drawing", (draw) => {
    io.emit("drawing", draw);
  });
```
Script.js
```
socket.emit("drawing", {
      x: newX,
      y: newY,
      stroke: context.lineWidth,
      color: context.strokeStyle,
    });
  }
  socket.on("drawing", drawEvent);
```

### Start Event

app.js
```
 socket.on("start", (coord) => {
    io.emit("start", coord);
  });
```
Script.js
```
socket.on("start", (coord) => {
  isMouseDown = true;
  [x, y] = coord;
});

startDrawing = (event) => {
      socket.emit("start", [event.offsetX, event.offsetY]);
    };
```

### Stop Event

app.js
```
socket.on("stop", (coord) => {
    io.emit("stop", coord);
  });
```
Script.js
```
socket.on("stop", (coord) => {
  if (!isMouseDown) return;
  isMouseDown = false;
  [x, y] = coord;
  drawLine(coord);
});

stopDrawing = (event) => {
      socket.emit("stop", [event.offsetX, event.offsetY]);
    };
```

### Move Event

app.js
```
socket.on("move", (coord) => {
    io.emit("move", coord);
  });
```
Script.js
```
socket.on("move", (coord) => {
  if (!isMouseDown) return;
  // [x, y] = coord;

  drawLine(coord);
});

onMouseMove = (event) => {
      socket.emit("move", [event.offsetX, event.offsetY]);
    };
```

### Reload Event

app.js
```
socket.on("reload", () => {
    randomWord = Math.floor(Math.random() * wordArray.data.length);
    io.emit("reload");
  });
```
Script.js
```
socket.on("reload", () => {
  location.reload();
  // hier waarschijnlijk
});

reloadButton.addEventListener(
  "click",
  () => {
    socket.emit("reload");
  },
  false
);
```
