console.log("Hi Suraj ");
let cunrentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  try {
    currfolder = folder;
    //let response = await fetch("http://127.0.0.1:5500/songs/");
    let response = await fetch(`http://127.0.0.1:5500/${folder}/`);

    let text = await response.text(); 
    //console.log(text);

    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        //songs.push(element.href.split("/songs/")[1]);
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }

    

    // show all the songs in the playist
    let songUL = document
      .querySelector(".songList")
      .getElementsByTagName("ul")[0];

    songUL.innerHTML = "";
    for (const song of songs) {
      songUL.innerHTML =
        songUL.innerHTML +
        `<li> <img class="invert" src="Assets/Images/music.svg" alt="">
                <div class="info">
                  <div >${song.replaceAll("%20", " ")}</div>
                  <div >Nagpurian </div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                <img class="invert" src="Assets/Images/play.svg" alt="">
              </div></li>`;
    }

    //Attach an event listener to each song
    Array.from(
      document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        //console.log(e.querySelector(".info").firstElementChild.innerHTML);
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });

    //console.log(songs);
    //return songs;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return songs
}

const playMusic = (track, pause = false) => {
  //let audio = new Audio("/songs/" +track)
  //cunrentSong.src = "/songs/" + track;
  cunrentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    cunrentSong.play();
    play.src = "Assets/Images/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbum() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text(); 
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index]; 
  
    if (e.href.includes("/songs")) {
      //console.log(e.href.split("/").slice(-1)[0]);
      let folder = e.href.split("/").slice(-1)[0];
      // get the meta data of the folder 
      let albumInfoResponse  = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let albumInfo  = await albumInfoResponse .json(); 
      //console.log(albumInfo);
      cardContainer.innerHTML = cardContainer.innerHTML + `<div class="cardContainer">
      <div data-folder="${folder}" class="card">
        <div  class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#000000"
              stroke-width="1.5"
            />
            <path
              d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z"
              stroke="#000000"
              fill="#000"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <img src="/songs/${folder}/cover.jpeg" alt="" />
        <h2>${albumInfo.title}</h2>
        <p>${albumInfo.description}</p>
      </div>`
    }
  }


  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      //console.log(item, item.currentTarget.dataset);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });

}

async function main() {
  // get the list song
  await getSongs("songs/ncs");
  //console.log(songs);

  playMusic(songs[0], true);

  //display albums on the page
  displayAlbum();

  //Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (cunrentSong.paused) {
      cunrentSong.play();
      play.src = "Assets/Images/pause.svg";
    } else {
      cunrentSong.pause();
      play.src = "Assets/Images/play.svg";
    }
  });

  //Listen for timeUpdate event
  cunrentSong.addEventListener("timeupdate", () => {
    // console.log(cunrentSong.currentTime, cunrentSong.duration);
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      cunrentSong.currentTime
    )} / ${secondsToMinutesSeconds(cunrentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (cunrentSong.currentTime / cunrentSong.duration) * 100 + "%";
  });

  //add an eventlistener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    //console.log( e.offsetX/e.target.getBoundingClientRect().width) *100
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    cunrentSong.currentTime = (cunrentSong.duration * percent) / 100;
  });

  // add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add an event listner for close btn
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event listner for previous and next btn
  previous.addEventListener("click", () => {
    console.log("Previous clicked");
    let index = songs.indexOf(cunrentSong.src.split("/").slice(-1)[0]);

    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    //cunrentSong.pause();
    console.log("Next clicked");
    //console.log(cunrentSong.src.split("/").slice(-1)[0])
    let index = songs.indexOf(cunrentSong.src.split("/").slice(-1)[0]);

    //console.log(songs ,index)
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to ", e.target.value, "/ 100");
      cunrentSong.volume = parseInt(e.target.value) / 100;
      if (cunrentSong.volume > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("Assets/Images/mute.svg" ,"Assets/Images/volume.svg")
        
      }
    });

  //Load the playlist whenever card is click
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      //console.log(item, item.currentTarget.dataset);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });


  //add event mute track

  document.querySelector(".volume>img").addEventListener("click", e=>{
    // console.log(e.target)
    // console.log("changing ",e.target.src)

    if (e.target.src.includes("Assets/Images/volume.svg")) {
      e.target.src = e.target.src.replace("Assets/Images/volume.svg" ,"Assets/Images/mute.svg")
      cunrentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value =0;
    }else{
      e.target.src = e.target.src.replace("Assets/Images/mute.svg" ,"Assets/Images/volume.svg")

      document.querySelector(".range").getElementsByTagName("input")[0].value =15;

      cunrentSong.volume = .10;

    }
  })

}

main();

//play the frist song

// var audio = new Audio(songs[10]);
// audio.play();

// audio.addEventListener("loadeddata", () => {
//   let duration = audio.duration;
//   console.log(audio.duration, audio.currentSrc, audio.currentTime);
// });
