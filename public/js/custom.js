$(document).ready(function () {
  $(".v-mCustomScrollbar").mCustomScrollbar({
    axis: "y", // vertical scrollbar
    theme: "dark",
  });

  if ($(window).width() <= 991) {
    $(".lr-mCustomScrollbar").mCustomScrollbar({
      axis: "x", // vertical scrollbar
      theme: "dark",
    });
  }

  $(".jsFilterAccordian .filters-links").each(function () {
    $(this).click(function () {
      $(this).toggleClass("active");
      $(this).siblings(".filter-body").slideToggle("fast");
      $(this)
        .parents(".filters-row")
        .siblings(".filters-row")
        .find(".filters-links")
        .removeClass("active");
      $(this)
        .parents(".filters-row")
        .siblings(".filters-row")
        .find(".filter-body")
        .slideUp("fast");
    });
  });

  $(".filter-dropdown .dropdown-menu").click(function (e) {
    e.stopPropagation();
  });

  $(".jsSearchBar")
    .change(function () {
      if ($(this).val().length != 0) {
        $(this).parents(".search-bar-inner").addClass("actives");
      } else if ($(this).val().length == 0) {
        $(this).parents(".search-bar-inner").removeClass("actives");
      }
    })
    .focus(function () {
      $(this).parents(".search-bar-inner").addClass("actives");
    })
    .blur(function () {
      if ($(this).val().length != 0) {
        $(this).parents(".search-bar-inner").addClass("actives");
      } else if ($(this).val().length == 0) {
        $(this).parents(".search-bar-inner").removeClass("actives");
      }
    });

  if ($(window).width() >= 992) {
    $(".jsMenuToggle").click(function () {
      $(".layout-wrapper").toggleClass("layout-wrapper-collapsed");
      $(".navigation-menu-left-wrapper").toggleClass("navigation-collapsed");
      $(this).find("i").toggleClass("icon-menu-left");
    });
    $(".sub-menu-mCustomScrollbar").mCustomScrollbar({
      axis: "y",
      theme: "dark",
    });
  } else {
    $(".layout-wrapper").removeClass("layout-wrapper-collapsed");
    $(".navigation-menu-left-wrapper").removeClass("navigation-collapsed");
    $(".navigation-item")
      .find(".navigation-dropdown-menu")
      .removeClass("position-fixed dropdown-menu")
      .addClass("collapse");
    $(".navigation-item > .dropdown-toggle")
      .removeAttr("data-bs-auto-close")
      .attr("data-bs-toggle", "collapse");

    $(".jsMobileMenuToggle").click(function () {
      $(".navigation-menu-left-wrapper").addClass("active");
      $(".jsMenuToggle")
        .find("i")
        .removeClass("icon-menu-right")
        .addClass("icon-menu-left");
    });

    $(".jsMenuToggle").click(function () {
      $(".navigation-menu-left-wrapper").removeClass("active");
    });
  }

  if ($(window).width() > 767) {
    $(".languageSelect").select2({
      minimumResultsForSearch: Infinity,
      dropdownParent: $("#languageSelect"),
    });
  } else {
    $(".languageSelect").select2({
      minimumResultsForSearch: Infinity,
      dropdownParent: $("#languageSelect-xs"),
    });
  }

  $(".jsSeasonSelect").select2({
    minimumResultsForSearch: Infinity,
  });

  $(".paginationSelect").select2({
    minimumResultsForSearch: Infinity,
    dropdownParent: $("#paginationSelect"),
  });

  $(".jsSeasonSlider").on(
    "init reInit afterChange",
    function (event, slick, currentSlide, nextSlide) {
      if ($(window).width() > 1199) {
        if ($(".jsSeasonSlider .slider-row").length <= 4) {
          $(".jsSeasonSlider").removeClass("custom-dots slick-dotted");
        } else {
          $(".jsSeasonSlider").addClass("custom-dots slick-dotted");
        }
      }
    }
  );

  $(".jsSeasonSlider").slick({
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 5.1,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4.4,
          slidesToScroll: 1,
          infinite: false,
        },
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 3.7,
          slidesToScroll: 1,
          infinite: false,
          arrows: false,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 1,
          infinite: false,
          arrows: false,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.3,
          slidesToScroll: 1,
          infinite: false,
          arrows: false,
        },
      },
    ],
  });
});

$(window).resize(function () {
  if ($(window).width() >= 992) {
    $(".layout-wrapper").addClass("layout-wrapper-collapsed");
    $(".navigation-menu-left-wrapper").addClass("navigation-collapsed");
    $(".navigation-item")
      .find(".navigation-dropdown-menu")
      .removeClass("collapse")
      .addClass("position-fixed dropdown-menu");
    $(".navigation-item > .dropdown-toggle")
      .attr("data-bs-toggle", "dropdown")
      .attr("data-bs-auto-close", "outside");
  } else {
    $(".layout-wrapper").removeClass("layout-wrapper-collapsed");
    $(".navigation-menu-left-wrapper").removeClass("navigation-collapsed");
    $(".navigation-item")
      .find(".navigation-dropdown-menu")
      .removeClass("position-fixed dropdown-menu")
      .addClass("collapse");
    $(".navigation-item > .dropdown-toggle")
      .removeAttr("data-bs-auto-close")
      .attr("data-bs-toggle", "collapse");
  }
});

$(window).scroll(function () {});

$(window).scroll(function () {});
