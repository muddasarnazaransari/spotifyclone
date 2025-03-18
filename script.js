console.log("Let's add some JavaScript");
let currentSong = new Audio();
let currentIndex;
console.log("song: ", currentSong);

async function getPlaylistsURL() {
    try {
        let response = await fetch("http://127.0.0.1:5500/Portfolio%20Website/Projects/Spotify%20Clone/Playlist/");
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let text = await response.text(); 
        let div = document.createElement("div");
        div.innerHTML = text;
        let ancor = div.getElementsByTagName("a");
        console.log("Ancor : ", ancor);
        let playlists = [];
        console.log("Folder Name : ");
        for(let index = 0; index < ancor.length; index++)
        {
            const element = ancor[index];
            if (element.href.toLowerCase().includes("playlist/")) {
                console.log(element.href)
                playlists.push(element.href);
            }
        }
        return playlists;
    }catch(error)
    {
        console.error("Error !!", error);
    }
}

async function getImageExtention(currentPlaylist)
{
    let response = await fetch(`http://127.0.0.1:5500/Portfolio%20Website/Projects/Spotify%20Clone/Playlist/${currentPlaylist}/`);

    let text = await response.text(); 
    let div = document.createElement("div");
    div.innerHTML = text;
    console.log("Divs of images :" ,div);
    let anchor = div.getElementsByTagName("a");
    console.log(anchor);
    let imageName;

    //List of audio file extensions
    const imageFormats = ["jpg", "jpeg", "png", "webp"];

    for(let index = 0; index < anchor.length; index++)
    {
        const element = anchor[index];
        if(imageFormats.some(ext => element.href.toLowerCase().endsWith(ext)))
        {
            let imageURL = element.href.split("/");
            imageName = imageURL[imageURL.length - 1];
            console.log("Image Name : ", imageName);
            break;
        }
    }
    return imageName;
}

async function getPlaylists(playlistURL)
{
    let playlist = [];
    for(let index = 0; index < playlistURL.length; index++)
    {
        let temp = playlistURL[index].split("/");
        playlist.push(temp[temp.length - 1]);
    }
    return playlist;
}

async function displayPlaylist(playlists){
    let cardContainer = document.querySelector(".cardContainer");
    for(let index = 0; index < playlists.length; index++)
    {
        let folder = playlists[index];
        let imageName = await getImageExtention(folder);
        let getInfo = await fetch(`http://127.0.0.1:5500/Portfolio%20Website/Projects/Spotify%20Clone/Playlist/${folder}/info.json`);
        let response = await getInfo.json();
        cardContainer.innerHTML = cardContainer.innerHTML + `
                                                            <div class="card" data-folder="${folder}">
                                                                <div class="play-btn">
                                                                    <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="currentColor"></path></svg>
                                                                </div>
                                                                <img src="./Playlist/${folder}/${imageName}" alt="suzume playlist">
                                                                <h2>${response.title}</h2>
                                                                <p>${response.description}</p>
                                                            </div>
                                                            `

    }
}

async function getSongs(currentPlaylist) {

    let newCurrentPlaylist = "";
    for(let index = 0; index < currentPlaylist.length; index++)
    {
        if(currentPlaylist[index] === " ")
        {
            newCurrentPlaylist += "%20";
        }
        else
        {
            newCurrentPlaylist += currentPlaylist[index];
        }
    }
    try {
        let response = await fetch(`http://127.0.0.1:5500/Portfolio%20Website/Projects/Spotify%20Clone/Playlist/${newCurrentPlaylist}/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let text = await response.text(); 
        let div = document.createElement("div");
        div.innerHTML = text;
        let ancor = div.getElementsByTagName("a");
        let songs = [];

        //List of audio file extensions
        const audioFormats = [".mp3", ".wav", ".ogg", ".aac", ".flac", ".m4a", ".opus"];

        for(let index = 0; index < ancor.length; index++)
        {
            const element = ancor[index];
            if(audioFormats.some(ext => element.href.toLowerCase().endsWith(ext)))
            {
                songs.push(element.href);
            }
        }

        //Listing Songs
        let playlistUL = document.querySelector(".playList").getElementsByTagName("ul")[0];
        playlistUL.innerHTML = "";
        console.log("playlist UL", playlistUL);

        songs.forEach((songUrl, index) => {
            let li = document.createElement("li");
            let songName = getSongName(songUrl);

            li.innerHTML = `
                <div class="playlist-poster">
                    <svg class="playlist-play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="currentColor"></path>
                    </svg>
                </div>
                <h5>${songName}</h5>
            `;

            li.dataset.index = index; // Store song index in dataset
            playlistUL.appendChild(li);
        });

        let musicPlay = document.querySelector(".music-play");
        let playButton = document.querySelector(".music-play-icon");
        let pauseButton = document.querySelector(".music-pause-icon");
        let isPlaying = false;
    
        // Attach event listener to all the songs.
        Array.from(document.querySelector(".playList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element=>{
                currentIndex = parseInt(e.dataset.index);
                playMusic(currentIndex, songs);
                playButton.style.display = "none";
                pauseButton.style.display = "block";
                console.log("Music play");
            })
        })

        return songs;
    }catch(error)
    {
        console.error("Error !!", error);
    }
}

let secondsToMinuteFormat = (seconds) =>
{
    if(isNaN(seconds) || seconds < 0)
    {
        return "00:00";
    }

    let minute = Math.floor(seconds / 60);
    let second = Math.floor(seconds % 60);

    let minuteFormat = minute < 10 ? '0' + minute : minute;
    let secondFormat = second < 10 ? '0' + second : second;

    return `${minuteFormat} : ${secondFormat}`;
}

const playMusic = (currentIndex, songs) => {
    currentSong.src = songs[currentIndex];
    currentSong.play();
}

function getSongName(url){
    let path = url.split("/"); //This will return array
    let filename = decodeURIComponent(path[path.length -1]);
    let tempName = filename.split(".");
    let songName = tempName[0];
    return songName;
}

async function main()
{

    let playlistURL = await getPlaylistsURL();
    console.log("Playlist URL : ", playlistURL);

    let playlists = await getPlaylists(playlistURL);
    console.log("Playlist here  : ", playlists);

    await displayPlaylist(playlists);

    //Current Playlist.
    let currentPlaylist = decodeURIComponent(playlists[0]);
    console.log("Playlist: ",currentPlaylist);

    let songs = await getSongs(currentPlaylist);
    console.log(songs);

    let musicPlay = document.querySelector(".music-play");
    let playButton = document.querySelector(".music-play-icon");
    let pauseButton = document.querySelector(".music-pause-icon");
    let isPlaying = false;

    // Attach event listener to all the songs.
    Array.from(document.querySelector(".playList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=>{
            currentIndex = parseInt(e.dataset.index);
            playMusic(currentIndex, songs);
            playButton.style.display = "none";
            pauseButton.style.display = "block";
            console.log("Music play");
        })
    })

    musicPlay.addEventListener("click" ,() =>
    {
        if(currentSong.src)
        {
            if(currentSong.paused)
            {
                playButton.style.display = "none";
                pauseButton.style.display = "block";
                currentSong.play();
            }
            else
            {
                playButton.style.display = "block";
                pauseButton.style.display = "none";
                currentSong.pause();
            }
        }
    });


    // To get current and total time
    let currentTime = document.querySelector(".currentTime");
    currentTime.innerHTML = "00:00";
    let totalTime = document.querySelector(".totalTime");
    totalTime.innerHTML = "00:00";

    // Adding a listener to update the current and total time of the track.
    currentSong.addEventListener("timeupdate", () => {
        currentTime.innerHTML = secondsToMinuteFormat(currentSong.currentTime);
        totalTime.innerHTML = secondsToMinuteFormat(currentSong.duration);
        let progressBar = document.querySelector(".progress");
        progressBar.style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });


    //Adding an event listener to seek the audio from seek bar.
    document.querySelector(".seekbar").addEventListener("click", e=> {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".progress").style.width = percent + "%";
        currentSong.currentTime = currentSong.duration * (percent / 100);
    })


    // Adding an event listener to previous buttoon
    document.querySelector("#previous").addEventListener("click", e => {
        currentIndex = ((currentIndex - 1 + songs.length) % songs.length);
        console.log("Index: ", currentIndex);
        console.log("Songs Length : ", songs.length);
        playMusic(currentIndex, songs);
    })


    // Adding an event listener to next buttoon
    document.querySelector("#next").addEventListener("click", e => {
        currentIndex = (currentIndex + 1) % songs.length;
        console.log("Index: ", currentIndex);
        playMusic(currentIndex, songs);
    })


    //Adding event listener to volume button.
    document.querySelector(".volume-seekbar").addEventListener("click", (e) => {
        let seekbar = e.currentTarget;
        let percentage = e.offsetX / seekbar.clientWidth;
        
        // Clamp the volume between 0 and 1
        percentage = Math.max(0, Math.min(1, percentage));
    
        document.querySelector(".volume-progress-bar").style.width = (percentage * 100) + "%";
        currentSong.volume = percentage;
    });

    //Load Playlist whenever card is clicked.
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getSongs(items.currentTarget.dataset.folder);
            playMusic(0, songs);
            playButton.style.display = "none";
            pauseButton.style.display = "block";
        })
    });

}

main();