// JavaScript to add and remove the autofocus class for specific buttons




numberElements = 4;
numberViewed = 4;
currentPosition = 1;

function countLi() {
    return jQuery("#galleries-list ul li").length;
};


function slideRight() {
    if (countLi() > numberViewed)
        if (currentPosition == (countLi() - (numberViewed - 1))) {
            jQuery("#galleries-list ul li").css("visibility","hidden").css("transition", "none");
            setSliderPosition(numberViewed + 1, countLi());
            jQuery("#galleries-list ul li").css("transition", "left .75s ease-out").css("visibility","visible");
            setSliderPosition(currentPosition + 1, countLi());
            return;
        } else return setSliderPosition(currentPosition + 1, countLi());
};

function slideLeft() {
    if (countLi() > numberViewed)
        if (currentPosition == 1) {
            jQuery("#galleries-list ul li").css("transition", "none");
            setSliderPosition(countLi() - (2 * numberViewed + 1), countLi()).css("transition", "left .75s ease-out");
            return setSliderPosition(currentPosition - 1, countLi());
        } else return setSliderPosition(currentPosition - 1, countLi());
};

function setSliderPosition(n1, count) {
    if (n1 < 1) {
        setSliderPosition((count - (numberViewed - 1)) + n1, count);
        return
    };
    n1 = (n1 - 1) % (count - (numberViewed - 1)) + 1;
    currentPosition = n1;
    return jQuery("#galleries-list ul li").css('left', function() {
        return -(n1 - 1) * jQuery("#galleries-list ul li").width();
    });
};

function initWidths() {
    jQuery("#galleries-list ul li").css('width', (100 / countLi()) + '%');
    jQuery("#galleries-list ul").css('width', (100 + (countLi() - numberViewed) * (100 / numberViewed)) + '%');
};

function initClones() {
    if (countLi() >= numberViewed) {
        for (i = 1; i < numberViewed + 1; i++) {
            jQuery("#galleries-list ul li:nth-child(" + i + ")").clone().insertAfter("#galleries-list ul li:last-child");
        }
        c = countLi();
        for (i = c - numberViewed + 1; i <= c; i++) {
            jQuery("#galleries-list ul li:nth-last-child(" + i + ")").clone().insertBefore("#galleries-list ul li:first-child");
        }
    }
};

function initSlider() {
    initClones();
    initResponsive();
    initWidths();
};

function initPosition() {
    setSliderPosition(currentPosition, countLi());
};

function initResponsive() {
    if (jQuery(window).width() > 1000) {
        if (numberViewed != 3) {
            numberViewed = 3;
            initWidths();
        }
    } else if (jQuery(window).width() > 800) {
        if (numberViewed != 3) {
            numberViewed = 3;
            initWidths();
        }
    } else if (jQuery(window).width() > 600) {
        if (numberViewed != 2) {
            numberViewed = 2;
            initWidths();
        }
    } else if (numberViewed != 1) {
        numberViewed = 1;
        initWidths();
    };
    initPosition();
};
jQuery(document).ready(function() {
    initSlider();
    jQuery(window).resize(initResponsive);
    jQuery("#galleries-list .slide-left").click(slideLeft);
    jQuery("#galleries-list .slide-right").click(slideRight);
});




gsap.registerPlugin(MotionPathPlugin);

// Now you can use the MotionPathPlugin in your animations
if(document.querySelector(".arrow")) {
var animation = gsap.to(".arrow", {
  duration: 11,
  
  ease: "none",
  motionPath: {
    path: ".path",
    align: ".path",
    alignOrigin: [0.5, 0.5],
    autoRotate: false,
    start: 0,
  },
  repeat: -1,
});
}

if(document.querySelector(".arrows")) {
var animations = gsap.to(".arrows",{
	duration:9,
	ease:"none",
	motionPath:{
		path:".paths",
		align: ".paths",
		alignOrigin:[0.5, 0.5],
		autoRotate:true,
	
},
	 repeat: -1
} )
}




//on scroll revael animation

function animateFrom(elem, direction) {
  direction = direction || 1;
  var x = 0,
      y = direction * 100;
  if (elem.classList.contains("gs_reveal_fromLeft")) {
      x = -100;
      y = 0;
  } else if (elem.classList.contains("gs_reveal_fromRight")) {
      x = 100;
      y = 0;
  }
  elem.style.transform = "translate(" + x + "px, " + y + "px)";
  elem.style.opacity = "0";
  gsap.fromTo(elem, { x: x, y: y, autoAlpha: 0 }, {
      duration: 1.25,
      x: 0,
      y: 0,
      autoAlpha: 1,
      ease: "expo",
      overwrite: "auto"
  });
}

function hide(elem) {
  gsap.set(elem, { autoAlpha: 0 });
}


document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".gs_reveal").forEach(function (elem) {
      hide(elem); // assure that the element is hidden when scrolled into view

      ScrollTrigger.create({
          trigger: elem,
          markers: false,
          once: true, // Play the animation only once
          onEnter: function () { animateFrom(elem) },
          onEnterBack: function () { animateFrom(elem, -1) },
         
      });
  });
});


