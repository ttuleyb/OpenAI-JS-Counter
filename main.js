// ==UserScript==
// @name         GPT-4 Limit Counter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://chat.openai.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
// function to create or update a cookie with a given name and value
function setCookie(name, value) {
    document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
  }

  // function to retrieve the value of a cookie with a given name
  function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${name}=`)) {
        return cookie.substring(`${name}=`.length, cookie.length);
      }
    }
    return null;
  }

  function checkForGPT4() {
    // select all elements with the "flex" class
    const elements = document.querySelectorAll(".flex");

    // loop through the elements and check for the text "Model: GPT-4"
    let hasGPT4 = false;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const textContent = element.textContent;
      const regex = /Model:\s*GPT-4/;
      if (regex.test(textContent)) {
        hasGPT4 = true;
        break;
      }
    }

    // return whether any element contains "Model: GPT-4"
    return hasGPT4;
  }

  function timeLeftToReset() {
    const now = Date.now();
    const timeLeftInMs = threeHoursInMillis - (now - timestamp);
    if (timeLeftInMs < 0) {
      return "None";
    }
    const secondsLeft = Math.floor(timeLeftInMs / 1000) % 60;
    const minutesLeft = Math.floor(timeLeftInMs / (1000 * 60)) % 60;
    const hoursLeft = Math.floor(timeLeftInMs / (1000 * 60 * 60)) % 24;
    const daysLeft = Math.floor(timeLeftInMs / (1000 * 60 * 60 * 24));

    let formattedTimeLeft = "";
    if (daysLeft > 0) {
      formattedTimeLeft += `${daysLeft} days, `;
    }
    if (hoursLeft > 0) {
      formattedTimeLeft += `${hoursLeft} hours, `;
    }
    if (minutesLeft > 0) {
      formattedTimeLeft += `${minutesLeft} minutes, `;
    }
    formattedTimeLeft += `and ${secondsLeft} seconds`;

    return formattedTimeLeft;
  }


  function enabled() {
    return checkForGPT4();
  }

// function to replace any occurrence of "Regenerate response" or "Stop generating" with the new text that includes the count of Enter key presses
function replaceText() {
    if (!enabled()){
        console.log("This isn't GPT-4")
        return;
    }
    const elements = document.querySelectorAll('.flex.w-full.items-center.justify-center.gap-2, button.btn');
    const count = parseInt(getCookie("enterCount")) || 25;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const textNode = element.childNodes[0].childNodes[1];
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        if (textNode.textContent.trim() === "Regenerate response") {
          textNode.textContent = `Regenerate Response (${count}) Reset in ${timeLeftToReset()}`;
          element.addEventListener("click", event => {
            setCookieAndDecrementCount();
          });
        } else if (textNode.textContent.trim() === "Stop generating") {
          textNode.textContent = `Stop Generating (${count}) Reset in ${timeLeftToReset()}`;
        }
      }
    }
  }

  function setCookieAndDecrementCount() {
    if (!enabled()) {
      console.log("GPT-4 message limit not found");
      return;
    }

    console.log("Reducing count");

    // Get the current count from the cookie
    count = parseInt(getCookie("enterCount")) || 25;

    // Decrement the count and update the cookie
    count--;
    setCookie("enterCount", count);

    // If the count reaches 0, do nothing
  }

  function attachToButtons() {
    if (!enabled()) {
        return;
    }
    const buttons = document.querySelectorAll(".btn.relative.btn-primary.mr-2");

    buttons.forEach(button => {
      const buttonText = button.querySelector(".flex").textContent.trim();
      if (buttonText === "Save & Submit") {
        console.log("Found button");
        button.setAttribute("tabindex", "0");

        isHovering = false;

        button.textContent = `Save & Submit (${count})`;

        button.addEventListener("mouseenter", event => {
          console.log("Hovering");
          isHovering = true;
        });

        button.addEventListener("mouseleave", event => {
          console.log("Not hovering");
          isHovering = false;
        });

        addEventListener("mousedown", event => {
          if (isHovering) {
            isHovering = false;
            console.log("pressed!");
            // Remove listeners
            removeEventListener("mousedown", event);
            button.removeEventListener("mouseenter", event);
            button.removeEventListener("mouseleave", event);

            setCookieAndDecrementCount();
          }
        });
      }
    });
  }

  // initialize the count and timestamp variables from the cookies or to their default values
  let count = parseInt(getCookie("enterCount")) || 25;
  let timestamp = parseInt(getCookie("enterTimestamp")) || Date.now();

  // check if the timestamp is more than 3 hours ago and reset the count if it is
  const threeHoursInMillis = 3 * 60 * 60 * 1000;
  const now = Date.now();
  if (now - timestamp > threeHoursInMillis) {
    count = 25
    timestamp = now;
    setCookie("enterCount", count);
    setCookie("enterTimestamp", timestamp);
  }

  // add a listener for the keydown event
  document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      setCookieAndDecrementCount();
    }
  });

  // replace the text every second
  setInterval(replaceText, 1000);
  setInterval(attachToButtons, 100);


})();