/* eslint-disable no-useless-escape */
/* eslint-disable no-plusplus */
/* eslint-disable no-new */

// Waves.init();
AOS.init();
Waves.attach(".section, .tags", ["waves-block", "waves-float", "waves-light"]);
Waves.attach(".img.wrap");
const clipboard = new ClipboardJS(".tags,#export > div > div > button");
const notyf = new Notyf({
  types: [{
    type: "success",
    background: "#343434",
    duration: 1500,
  },
  {
    type: "error",
    dismissible: true,
    duration: 2500,
  },
  ],
});

const log = (string) => {
  console.log(string);
};

const showYoutubeMetaData = async (data) => {
  $("#export > button").on("click", () => {
    saveAs(
      new Blob([JSON.stringify(data, null, 4)], {
        type: "application/json",
        name: `${data.snippet.title}.json`,
      }),
    );
  });

  window.location.href = "#result";

  $("#thumbnail").attr("src", data.snippet.thumbnails[0].url);
  $("#thumbnails > div").html("");
  $("#topicDetails > ul").html("");
  $("#videoTags").html("");

  for (let i = 0; i <= 3; i++) {
    $("#thumbnails > div").append(
      `<img src="${data.snippet.thumbnails[i].url}" />`,
    );
  }

  $("#result").show();
  log(data);

  if (data.snippet) {
    $("#channelTitle").html(data.snippet.channelTitle);
    $("#channelDescription").html(data.snippet.description);
    $("#channelId").html(data.snippet.channelId);

    $("#videoTitle").html(data.snippet.title);
    $("#videoDescription").html(data.snippet.description);
    $("#videoPublishedAt").html(data.snippet.publishedAt);

    if (data.snippet.tags) {
      data.snippet.tags.forEach((tag) => {
        $("#videoTags").append(
          `<i class="tags" data-clipboard-text="${tag}" >${tag}</i>`,
        );
      });
      // tippy('.tags', { content: 'Copied !', animation: 'shift-away' });
    }
  }

  if (data.statistics) {
    $("#viewCount").html(data.statistics.viewCount);
    $("#likeCount").html(data.statistics.likeCount);
    $("#favoriteCount").html(data.statistics.favoriteCount);
    $("#commentCount").html(data.statistics.commentCount);
  } else {
    $("#Statistics").addClass("not-available");
  }

  if (data.status) {
    $("#embeddable").html(data.status.embeddable);
    $("#license").html(data.status.license);
    $("#madeForKids").html(data.status.madeForKids);
    $("#privacyStatus").html(data.status.privacyStatus);
    $("#publicStatsViewable").html(data.status.publicStatsViewable);
    $("#uploadStatus").html(data.status.uploadStatus);
  } else {
    $("#status").addClass("not-available");
  }

  if (data.contentDetails) {
    $("#caption").html(data.contentDetails.caption);
    $("#definition").html(data.contentDetails.definition);
    $("#dimension").html(data.contentDetails.dimension);
    $("#duration").html(data.contentDetails.duration);
    $("#licensedContent").html(data.contentDetails.licensedContent);
    $("#projection").html(data.contentDetails.projection);
  } else {
    $("#contentDetails").addClass("not-available");
  }

  if (Object.keys(data.recordingDetails).length > 0) {
    if (data.recordingDetails.locationDescription) {
      $("#location").html(data.recordingDetails.locationDescription);
    }
    $("#altitude").html(data.recordingDetails.location.altitude);
    $("#latitude").html(data.recordingDetails.location.latitude);
    $("#longitude").html(data.recordingDetails.location.longitude);
  } else {
    $("#geolocationDetails").addClass("not-available");
  }

  if (data.topicDetails.topicCategories.length > 0) {
    data.topicDetails.topicCategories.forEach((topic) => {
      $("#topicDetails ul").append(`<li><a href="${topic}">${topic}</a></li>`);
    });
  } else {
    $("#topicDetails").addClass("not-available");
  }

  $("#share-url").text(
    `${window.location.origin}${window.location.pathname}?id=${data.id}`,
  );
  $("#export > div > div > button").attr(
    "data-clipboard-text",
    `${window.location.origin}${window.location.pathname}?id=${data.id}`,
  );
};

const handleAjaxError = async (jqXHR) => {
  switch (jqXHR.status) {
    case 404:
      Swal.fire("Error 404", "Video Not Found", "warning");
      break;
    case 429:
      Swal.fire(
        "Error 429",
        "We're sorry, but you have sent too many requests to us recently. Please try again later.",
        "warning",
      );
      break;
    case 400:
      Swal.fire("Error 400", "Invalid URL", "warning");
      break;
    case 500:
      Swal.fire(
        "Error 500",
        "Apparentily something went wrong on the server's side. Please try again later.",
        "warning",
      );
      break;
    default:
      Swal.fire(
        "Unexpected Error",
        "Unknown error occurred while processing your request. Please try again.",
        "warning",
      );
  }
};

const getYoutubeMetadata = async (videoID) => {
  $.ajax({
    url: `./api/video/${videoID}`,
    method: "get",
    beforeSend: () => {
      $(".please_wait").show();
      $(".fa-spinner").css("display", "block");
      $(".result").hide();
      $(".fa-search").hide();
      $(".submit.btn").prop("disabled", true);
      $("#input-url").prop("disabled", true);
    },
    success: (data) => {
      showYoutubeMetaData(data);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      notyf.error("AJAX request failed!");
      handleAjaxError(jqXHR, textStatus, errorThrown);
    },
    complete: () => {
      $(".submit.btn").prop("disabled", false);
      $("#input-url").prop("disabled", false);
      $(".fa-search").show();
      $(".fa-spinner").hide();
      $(".please_wait").hide();
    },
    dataType: "json",
  });
};

const submitUrl = async (data) => {
  $("#tyyit").hide();

  const url = data || $("#input-url").val();
  try {
    const regExp = /^.*(youtu\.be\/|v\/|shorts\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      getYoutubeMetadata(match[2]);
    } else {
      log("Invalid URL!");
      notyf.error("Invalid URL!");
    }
  } catch (error) {
    log(error);
  }
};

const checkForClipbordUrl = async () => {
  const regExp = /^.*(youtu\.be\/|v\/|shorts\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const clipbaordPermission = await navigator.permissions.query({
    name: "clipboard-read",
    allowWithoutGesture: false,
  });

  // log(clipbaordPermission.state);

  if (clipbaordPermission.state === "granted") {
    navigator.clipboard
      .readText()
      .then((text) => {
        if (text.match(regExp) && text !== $("#input-url").val()) {
          $("#tyyit").hide();
          notyf.success("Sucessfully get URL from clipboard!");
          $("#input-url").val(text);
          submitUrl(text);
        }
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  } else if (clipbaordPermission.state === "prompt") {
    navigator.clipboard.readText();
  }
};

const tryIt = () => {
  $("#input-url").val("");
  const typed = new Typed("#input-url", {
    strings: ["https://youtu.be/jNQXAC9IVRw"],
    typeSpeed: 80,
    loop: false,
    onComplete: () => {
      $(".submit.btn").click();
      $("#tyyit").hide();
    },
  });
};

clipboard.on("success", (e) => {
  console.info("Text:", e.text);

  if (e.text.startsWith("http")) {
    notyf.success("URL Sucessfully Copied to clipbaord!");
  } else {
    notyf.success("Tag Sucessfully Copied to clipbaord!");
  }

  e.clearSelection();
});

$("#youtubeForm").submit((e) => {
  e.preventDefault();
  submitUrl();
});

window.onload = () => {
  try {
    const url = new URL(window.location.href);
    const urlSearch = new URL(url).search;
    const UrlParam = new URLSearchParams(urlSearch);

    if (UrlParam.has("id")) {
      getYoutubeMetadata(UrlParam.get("id"));
      $("#tyyit").hide();
    }
  } catch (error) {
    /* n/a  */
  }
};

setInterval(checkForClipbordUrl, 10000);
