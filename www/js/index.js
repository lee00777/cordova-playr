let APP = {
  tracks: [
    {
      src: "file:///android_asset/www/media/Billie_Eilish-Bad_guy.mp3",
      artist: "Billie Eilish",
      title: "Bad guy",
      picture: "./media/bad_guy.jpg",
      length: 200,
      list: 0,
    },
    {
      src: "file:///android_asset/www/media/Lukas_Graham-7_years.mp3",
      artist: "Lukas Graham",
      title: "7 years",
      picture: "./media/7_years.jpg",
      length: 235,
      list: 1,
    },
    {
      src: "file:///android_asset/www/media/Rihanna-Work_ft_Drake.mp3",
      artist: "Rihanna",
      title: "Work ft.Drake",
      picture: "./media/work.png",
      length: 216,
      list: 2,
    },
    {
      src: "file:///android_asset/www/media/Imagine_Dragons-Thunder.mp3",
      artist: "Imagine Dragons",
      title: "Thunder",
      picture: "./media/thunder.jpg",
      length: 217,
      list: 3,
    },
    {
      src: "file:///android_asset/www/media/Ariana_Grande-Side_To_Side.mp3",
      artist: "Ariana Grande",
      title: "Side to side",
      picture: "./media/side_to_side.png",
      length: 222,
      list: 4,
    },
  ],
  media: null,
  target: null,
  statusNum: null,
  status: {
    0: "MEDIA_NONE",
    1: "MEDIA_STARTING",
    2: "MEDIA_RUNNING",
    3: "MEDIA_PAUSED",
    4: "MEDIA_STOPPED",
  },
  err: {
    1: "MEDIA_ERR_ABORTED",
    2: "MEDIA_ERR_NETWORK",
    3: "MEDIA_ERR_DECODE",
    4: "MEDIA_ERR_NONE_SUPPORTED",
  },
  ready: function () {
    APP.addListeners();
    PAGES.makeHomePage();
  },
  success: function () {
    let lastIndex = APP.tracks.length;
    APP.target = parseInt(APP.target) + 1;
    if (APP.target === lastIndex) {
      APP.target = 0;
    }
    let src = APP.tracks[APP.target].src;
    APP.media = new Media(src, APP.success, APP.fail, APP.statusChange);
    let target = APP.tracks[APP.target];
    PAGES.showNewSong(target);
  },
  fail: function (err) {
    console.warn("failure");
    console.error(err);
  },
  statusChange: function (status) {
    APP.statusNum = status;
    console.log("media status is now " + APP.status[status]);
  },
  addListeners: function () {
    document.querySelector("#homeBtn").addEventListener("click", PAGES.showHomePage);
    document.querySelector("#homeBtn").addEventListener("click", PAGES.showPreview);
    document.querySelector(".preview-pause-btn").addEventListener("click", APP.pause);
    document.querySelector(".preview-pause-btn").addEventListener("click", PAGES.showPrevPlayBtn);
    document.querySelector(".preview-play-btn").addEventListener("click", APP.resume);
    document.querySelector(".preview-play-btn").addEventListener("click", PAGES.showPrevPauseBtn);
    document.querySelector(".play-btn").addEventListener("click", APP.resume);
    document.querySelector(".pause-btn").addEventListener("click", APP.pause);
    document.querySelector(".ff-btn").addEventListener("click", APP.ff);
    document.querySelector(".rew-btn").addEventListener("click", APP.rew);
    document.addEventListener("pause", () => {
      APP.media.release();
    });
  },
  play: function (ev) {
    if (APP.statusNum === 2) {
      APP.media.pause();
    }
    let target = ev.currentTarget;
    APP.target = target.getAttribute("list");
    let src = APP.tracks[APP.target].src;
    APP.media = new Media(src, APP.success, APP.fail, APP.statusChange);
    APP.media.play();
    APP.getPosition(APP.target);
  },
  getPosition: function (index) {
    let rangeBar = document.querySelector("#range");
    rangeBar.max = APP.tracks[index].length;
    let timer = setInterval(() => {
      APP.media.getCurrentPosition((pos) => {
        let currentPosition = document.querySelector("#currentPosition");
        let position = pos;
        PAGES.changeTimeFormat(position, currentPosition);
        rangeBar.value = pos;
      });
    }, 100);
    if (APP.statusNum === 3 || APP.statusNum === 4) {
      clearInterval(timer);
    }
  },
  resume: function (ev) {
    APP.media.play();
    PAGES.showPauseBtn();
    PAGES.rotateThumbnail();
  },
  pause: function () {
    APP.media.pause();
    PAGES.showResumeBtn();
    PAGES.stopThumbnail();
  },
  ff: function () {
    let dur = APP.media.getDuration();
    APP.media.getCurrentPosition((pos) => {
      console.log("current position", pos);
      console.log("duration", dur);
      pos += 10;
      if (pos < dur) {
        APP.media.seekTo(pos * 1000);
      }
    });
  },
  rew: function () {
    APP.media.getCurrentPosition((pos) => {
      pos -= 10;
      if (pos > 0) {
        APP.media.seekTo(pos * 1000);
      } else {
        APP.media.seekTo(0);
      }
    });
  },
};
const PAGES = {
  makeHomePage: function () {
    let playlist = document.querySelector(".playlist");
    let df = document.createDocumentFragment();
    APP.tracks.forEach((track) => {
      let card = document.createElement("div");
      card.setAttribute("class", "song");
      card.setAttribute("list", track.list);
      let pic = document.createElement("img");
      pic.setAttribute("class", "home_pic");
      pic.src = track.picture;
      let artist = document.createElement("p");
      artist.setAttribute("class", "home_artist");
      artist.textContent = track.artist;
      let duration = document.createElement("p");
      duration.setAttribute("class", "home_dur");
      let length = track.length;
      PAGES.changeTimeFormat(length, duration);
      let title = document.createElement("p");
      title.setAttribute("class", "home_title");
      title.textContent = track.title;
      let info_card = document.createElement("div");
      info_card.setAttribute("class", "info_card");
      info_card.append(title);
      info_card.append(artist);
      card.append(pic);
      card.append(info_card);
      card.append(duration);
      df.append(card);
      card.addEventListener("click", APP.play);
      card.addEventListener("click", PAGES.showPauseBtn);
      card.addEventListener("click", PAGES.rotateThumbnail);
      card.addEventListener("click", PAGES.showPlayPage);
      card.addEventListener("click", PAGES.hidePreview);
    });
    playlist.append(df);
  },
  showPlayPage: function (ev) {
    document.querySelector(".page.active").classList.remove("active");
    document.querySelector("#play").classList.add("active");
    let img = document.querySelector(".thumbnail");
    APP.target = ev.currentTarget.getAttribute("list");
    img.src = APP.tracks[APP.target].picture;
    let artist = document.querySelector("#artist");
    artist.textContent = APP.tracks[APP.target].artist;
    let track = document.querySelector("#track");
    track.textContent = APP.tracks[APP.target].title;
    let duration = document.querySelector("#duration");
    let length = APP.tracks[APP.target].length;
    PAGES.changeTimeFormat(length, duration);
  },
  showHomePage: function () {
    document.querySelector(".page.active").classList.remove("active");
    document.querySelector("#home").classList.add("active");
  },
  showNewSong: function (target) {
    let img = document.querySelector(".thumbnail");
    img.src = target.picture;
    let duration = document.querySelector("#duration");
    let length = target.length;
    PAGES.changeTimeFormat(length, duration);
    let artist = document.querySelector("#artist");
    artist.textContent = target.artist;
    let track = document.querySelector("#track");
    track.textContent = target.title;
    let rangeBar = document.querySelector("#range");
    rangeBar.max = target.length;
    APP.media.play();
  },
  prev_thumbnail: null,
  prev_title: null,
  showPreview: function (ev) {
    let prev = document.querySelector(".preview");
    prev.classList.remove("off");
    let prev_thumbnail = document.createElement("img");
    prev_thumbnail.setAttribute("class", "prev_thumbnail");
    PAGES.prev_thumbnail = APP.tracks[APP.target].picture;
    prev_thumbnail.src = PAGES.prev_thumbnail;
    let prev_title = document.createElement("div");
    prev_title.setAttribute("class", "prev_title");
    PAGES.prev_title = APP.tracks[APP.target].title;
    prev_title.textContent = PAGES.prev_title;
    let curPos = document.createElement("div");
    curPos.setAttribute("class", "prev_pos");
    let rangeBar = document.querySelector("#range");
    console.log(APP.statusNum);
    let timer = setInterval(() => {
      PAGES.changeTimeFormat(rangeBar.value, curPos);
    }, 100);
    let prev_card = document.createElement("div");
    prev_card.setAttribute("class", "prev_card");
    prev_card.append(prev_title);
    prev_card.append(prev_thumbnail);
    prev_card.append(curPos);
    prev.append(prev_card);
    if (APP.statusNum === 2) {
      PAGES.showPrevPauseBtn();
    } else if (APP.statusNum === 3) {
      PAGES.showPrevPlayBtn();
    }
  },
  prevPauseBtn: document.querySelector(".preview-pause-btn"),
  prevPlayBtn: document.querySelector(".preview-play-btn"),
  showPrevPauseBtn: function () {
    PAGES.prevPlayBtn.classList.add("off");
    PAGES.prevPauseBtn.classList.remove("off");
  },
  showPrevPlayBtn: function () {
    PAGES.prevPlayBtn.classList.remove("off");
    PAGES.prevPauseBtn.classList.add("off");
  },
  hidePreview: function () {
    let prev_card = document.querySelector(".prev_card");
    let prev = document.querySelector(".preview");
    if (APP.statusNum === 1 || APP.statusNum === 2 || APP.statusNum === 3) {
      prev.classList.add("off");
      prev_card.remove();
    }
  },
  changeTimeFormat: function (len, dur) {
    let minutes = Math.floor(len / 60);
    let seconds = Math.floor(len - minutes * 60);
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    dur.textContent = `${minutes}:${seconds}`;
  },
  showPauseBtn: function () {
    document.querySelector(".play-btn").classList.add("off");
    document.querySelector(".pause-btn").classList.remove("off");
  },
  showResumeBtn: function () {
    document.querySelector(".pause-btn").classList.add("off");
    document.querySelector(".play-btn").classList.remove("off");
  },
  rotateThumbnail: function () {
    document.querySelector(".thumbnail").classList.remove("off");
  },
  stopThumbnail: function () {
    document.querySelector(".thumbnail").classList.add("off");
  },
};
const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
document.addEventListener(ready, APP.ready);
