console.log("Let's add some JavaScript");
console.log("new changes");

let currentSong = new Audio();
let currentIndex = 0;
let songs = [];

console.log("Song: ", currentSong);

async function getPlaylistsURL() {
    try {
        let response = await fetch("/Playlist");
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let text = await response.text(); 
        let div = document.createElement("div");
        div.innerHTML = text;
        let ancor = div.getElementsByTagName("a");
        let playlists = [];

        for (let element of ancor) {
            if (element.href.toLowerCase().includes("playlist/")) {
                console.log(element.href);
                playlists.push(element.href);
            }
        }
        return playlists;
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return [];
    }
}

async function getImageExtension(currentPlaylist) {
    try {
        let response = await fetch(`/Playlist/${encodeURIComponent(currentPlaylist)}`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;

        let anchor = div.getElementsByTagName("a");
        const imageFormats = ["jpg", "jpeg", "png", "webp"];

        for (let element of anchor) {
            if (imageFormats.some(ext => element.href.toLowerCase().endsWith(ext))) {
                let imageURL = element.href.split("/");
                return imageURL[imageURL.length - 1];
            }
        }
    } catch (error) {
        console.error("Error fetching image:", error);
    }
    return "default.jpg"; // Fallback image
}

async function getPlaylists(playlistURL) {
    return playlistURL.map(url => url.split("/").pop());
}

async function displayPlaylist(playlists) {
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // Clear existing cards

    for (let folder of playlists) {
        let imageName = await getImageExtension(folder);
        try {
            let getInfo = await fetch(`/Playlist/${folder}/info.json`);
            let response = await getInfo.json();

            cardContainer.innerHTML += `
                <div class="card" data-folder="${folder}">
                    <div class="play-btn">
                        <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <img src="Playlist/${folder}/${imageName}" alt="Playlist Image">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        } catch (error) {
            console.error("Error fetching playlist info:", error);
        }
    }
}

async function getSongs(currentPlaylist) {
    try {
        let response = await fetch(`/Playlist/${encodeURIComponent(currentPlaylist)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let text = await response.text(); 
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchor = div.getElementsByTagName("a");

        songs = [];
        const audioFormats = [".mp3", ".wav", ".ogg", ".aac", ".flac", ".m4a", ".opus"];

        for (let element of anchor) {
            if (audioFormats.some(ext => element.href.toLowerCase().endsWith(ext))) {
                songs.push(element.href);
            }
        }

        let playlistUL = document.querySelector(".playList ul");
        playlistUL.innerHTML = ""; // Clear existing list

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

            li.dataset.index = index;
            li.addEventListener("click", () => playMusic(index));
            playlistUL.appendChild(li);
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (index) => {
    if (songs.length === 0) return;
    currentIndex = index;
    currentSong.src = songs[currentIndex];
    currentSong.play();
    togglePlayPause(true);
};

function getSongName(url) {
    let filename = decodeURIComponent(url.split("/").pop());
    return filename.split(".")[0];
}

const togglePlayPause = (isPlaying) => {
    document.querySelector(".music-play-icon").style.display = isPlaying ? "none" : "block";
    document.querySelector(".music-pause-icon").style.display = isPlaying ? "block" : "none";
};

async function main() {
    let playlistURL = await getPlaylistsURL();
    let playlists = await getPlaylists(playlistURL);
    await displayPlaylist(playlists);

    if (playlists.length > 0) {
        await getSongs(playlists[0]);
    }

    document.querySelector(".music-play").addEventListener("click", () => {
        if (currentSong.src) {
            if (currentSong.paused) {
                currentSong.play();
                togglePlayPause(true);
            } else {
                currentSong.pause();
                togglePlayPause(false);
            }
        }
    });

    document.querySelector("#previous").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(currentIndex);
    });

    document.querySelector("#next").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        playMusic(currentIndex);
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
    });

    document.querySelector(".volume-seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.clientWidth;
        currentSong.volume = Math.max(0, Math.min(1, percent));
        document.querySelector(".volume-progress-bar").style.width = `${percent * 100}%`;
    });

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(card.dataset.folder);
            playMusic(0);
        });
    });
}

main();
