// expanded.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Main app elements
  const pasteArea = document.getElementById('paste-area');
  const backgroundType = document.getElementById('background-type');
  const solidColorOptions = document.getElementById('solid-color-options');
  const gradientOptions = document.getElementById('gradient-options');
  const solidColor = document.getElementById('solid-color');
  const gradientStart = document.getElementById('gradient-start');
  const gradientEnd = document.getElementById('gradient-end');
  const saveImageButton = document.getElementById('save-image');
  const copyImageButton = document.getElementById('copy-image');
  const useWatermarkCheckbox = document.getElementById('use-watermark');
  const watermarkLogoInput = document.getElementById('watermark-logo');
  const saveWatermarkButton = document.getElementById('save-watermark');
  const watermarkOpacity = document.getElementById('watermark-opacity');
  const watermarkOpacityValue = document.getElementById('watermark-opacity-value');
  const watermarkSize = document.getElementById('watermark-size');
  const watermarkSizeValue = document.getElementById('watermark-size-value');
  const donateButton = document.getElementById('donate-button');
  // Check if the donateButton exists
  if (donateButton) {
    // Add this event listener for the donate button
    donateButton.addEventListener('click', () => {
      // Open the donation link in a new tab
      chrome.tabs.create({
        url: 'https://commerce.coinbase.com/checkout/cabb081c-a821-496b-a6ec-ac9a2a5cb0bf'
      });
    });
  } else {
    console.error('Donate button not found in the DOM.');
  }

  // Preset elements
  const colorPresets = document.querySelectorAll('.color-preset');
  const gradientPresets = document.querySelectorAll('.gradient-preset');

  let pastedImage = null;
  let watermarkLogo = new Image();
  let customWatermarkUploaded = false;

  // Variable to store the selected gradient
  let selectedGradient = '';

  // Determine if running as an extension
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

  // Add event listeners to color and gradient presets
  colorPresets.forEach(preset => preset.addEventListener('click', applyColorPreset));
  gradientPresets.forEach(preset => preset.addEventListener('click', applyGradientPreset));

  // Event Listeners
  pasteArea.addEventListener('paste', handlePaste);
  pasteArea.addEventListener('dragover', handleDragOver);
  pasteArea.addEventListener('drop', handleDrop);
  backgroundType.addEventListener('change', toggleBackgroundOptions);
  solidColor.addEventListener('input', applyBackground);
  gradientStart.addEventListener('input', applyBackground);
  gradientEnd.addEventListener('input', applyBackground);
  saveImageButton.addEventListener('click', saveImage);
  copyImageButton.addEventListener('click', copyImage);
  watermarkLogoInput.addEventListener('change', handleWatermarkLogoChange);
  saveWatermarkButton.addEventListener('click', saveWatermark);
  watermarkOpacity.addEventListener('input', function() {
    watermarkOpacityValue.textContent = `${watermarkOpacity.value}%`;
    applyWatermark();
  });
  watermarkSize.addEventListener('input', function() {
    watermarkSizeValue.textContent = `${watermarkSize.value}%`;
    applyWatermark();
  });
  useWatermarkCheckbox.addEventListener('change', applyWatermark);

  // Load saved watermark if available
  chrome.storage.local.get(['watermarkLogo'], function(result) {
    if (result.watermarkLogo) {
      watermarkLogo.src = result.watermarkLogo;
      customWatermarkUploaded = true;
    } else {
      watermarkLogo.src = 'image/logo.png'; // Default watermark
    }
  });

  // Initialize background options
  toggleBackgroundOptions();
  updateWatermarkOpacityValue();
  applyWatermark(); // Apply the default watermark settings

  // Functions for Main App Functionality

  function applyColorPreset(event) {
    const color = window.getComputedStyle(event.target).backgroundColor;
    solidColor.value = rgbToHex(color);
    backgroundType.value = 'solid';
    toggleBackgroundOptions();
    applyBackground();
  }

  function applyGradientPreset(event) {
    selectedGradient = event.target.getAttribute('data-gradient');
    const colors = selectedGradient.match(/#[a-fA-F0-9]{6}/g);

    if (colors && colors.length >= 2) {
      gradientStart.value = colors[0];
      gradientEnd.value = colors[colors.length - 1];
      backgroundType.value = 'gradient';
      toggleBackgroundOptions();
      applyBackground();
    } else {
      console.error('Could not extract colors from gradient:', selectedGradient);
    }
  }

  function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g);
    if (rgbValues) {
      return (
        '#' +
        rgbValues
          .map(x => parseInt(x).toString(16).padStart(2, '0'))
          .join('')
      );
    }
    return rgb; // Return the original value if it's not in rgb format
  }

  function handlePaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file') {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function(e) {
          pastedImage = new Image();
          pastedImage.onload = function() {
            pasteArea.innerHTML = '';
            pasteArea.appendChild(pastedImage);
            applyBackground();
          };
          pastedImage.onerror = function() {
            console.error('Failed to load the image');
            pastedImage = null;
            pasteArea.innerHTML = '<p>Failed to load the image. Please try again.</p>';
          };
          pastedImage.src = e.target.result;
        };
        reader.readAsDataURL(blob);
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(event) {
        pastedImage = new Image();
        pastedImage.onload = function() {
          pasteArea.innerHTML = '';
          pasteArea.appendChild(pastedImage);
          applyBackground();
        };
        pastedImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function toggleBackgroundOptions() {
    if (backgroundType.value === 'gradient') {
      gradientOptions.style.display = 'block';
      solidColorOptions.style.display = 'none';
    } else {
      gradientOptions.style.display = 'none';
      solidColorOptions.style.display = 'block';
    }
    applyBackground();
  }

  function applyBackground() {
    if (backgroundType.value === 'gradient') {
      if (selectedGradient) {
        pasteArea.style.background = selectedGradient;
      } else {
        pasteArea.style.background = `linear-gradient(to right, ${gradientStart.value}, ${gradientEnd.value})`;
      }
    } else {
      pasteArea.style.background = solidColor.value;
    }

    if (pastedImage) {
      pastedImage.style.display = 'block';
      pastedImage.style.margin = 'auto';
    }

    // Apply watermark
    applyWatermark();
  }

  function applyWatermark() {
    const existingWatermark = pasteArea.querySelector('.watermark');
    if (existingWatermark) {
      existingWatermark.remove();
    }

    if (useWatermarkCheckbox.checked && watermarkLogo.complete && watermarkLogo.naturalHeight !== 0) {
      const watermarkImg = document.createElement('img');
      watermarkImg.src = watermarkLogo.src;
      watermarkImg.classList.add('watermark');
      watermarkImg.style.position = 'absolute';
      watermarkImg.style.top = '50%';
      watermarkImg.style.left = '50%';
      watermarkImg.style.transform = 'translate(-50%, -50%)';
      watermarkImg.style.maxWidth = `${watermarkSize.value}%`;
      watermarkImg.style.maxHeight = `${watermarkSize.value}%`;
      watermarkImg.style.opacity = parseInt(watermarkOpacity.value) / 100;
      pasteArea.appendChild(watermarkImg);
    }
  }

  function handleWatermarkLogoChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        watermarkLogo.onload = function() {
          customWatermarkUploaded = true;
          applyBackground();
        };
        watermarkLogo.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function saveImage() {
    if (!pastedImage || !pastedImage.complete || pastedImage.naturalHeight === 0) {
      alert('No valid image to save! Please paste or drop an image first.');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 675;

    drawImageOnCanvas(canvas, ctx);

    canvas.toBlob(
      function(blob) {
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'twitter_image.png';

        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);

        downloadLink.click();

        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }, 100);
      },
      'image/png',
    );
  }

  function copyImage() {
    if (!pastedImage || !pastedImage.complete || pastedImage.naturalHeight === 0) {
      alert('No valid image to copy! Please paste or drop an image first.');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 675;

    drawImageOnCanvas(canvas, ctx);

    canvas.toBlob(
      function(blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(function() {
          alert('Image copied to clipboard! You can paste it in other applications.');
        }).catch(function(err) {
          console.error('Could not copy image: ', err);
          alert('Unable to copy image to clipboard. Your browser may not support this feature.');
        });
      },
      'image/png',
    );
  }

  function drawImageOnCanvas(canvas, ctx) {
    // Draw background
    if (backgroundType.value === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, gradientStart.value);
      gradient.addColorStop(1, gradientEnd.value);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = solidColor.value;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const paddingValuePx = 25; // Fixed padding
    const availableWidth = canvas.width - paddingValuePx * 2;
    const availableHeight = canvas.height - paddingValuePx * 2;
    const aspectRatio = pastedImage.naturalWidth / pastedImage.naturalHeight;
    const availableAspectRatio = availableWidth / availableHeight;

    let drawWidth, drawHeight;
    if (aspectRatio > availableAspectRatio) {
      drawWidth = availableWidth;
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawHeight = availableHeight;
      drawWidth = drawHeight * aspectRatio;
    }

    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;

    ctx.drawImage(pastedImage, drawX, drawY, drawWidth, drawHeight);

    // Draw watermark if enabled
    if (useWatermarkCheckbox.checked && watermarkLogo.complete && watermarkLogo.naturalHeight !== 0) {
      const logoSize = Math.min(canvas.width, canvas.height) * (parseInt(watermarkSize.value) / 100);
      const logoWidth = logoSize;
      const logoHeight = logoSize * (watermarkLogo.naturalHeight / watermarkLogo.naturalWidth);
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = (canvas.height - logoHeight) / 2;

      ctx.globalAlpha = parseInt(watermarkOpacity.value) / 100;
      ctx.drawImage(watermarkLogo, logoX, logoY, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
    }
  }

  function saveWatermark() {
    if (customWatermarkUploaded) {
      chrome.storage.local.set({watermarkLogo: watermarkLogo.src}, function() {
        alert('Watermark saved successfully!');
      });
    } else {
      alert('Please select a custom watermark image before saving.');
    }
  }

  function updateWatermarkOpacityValue() {
    watermarkOpacityValue.textContent = `${watermarkOpacity.value}%`;
    watermarkSizeValue.textContent = `${watermarkSize.value}%`;
  }
});
