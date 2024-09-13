/******/ (() => { // webpackBootstrap
/*!****************************!*\
  !*** ./expand/expanded.js ***!
  \****************************/
document.addEventListener('DOMContentLoaded', function() {
  const pasteArea = document.getElementById('paste-area');
  const backgroundType = document.getElementById('background-type');
  const solidColorOptions = document.getElementById('solid-color-options');
  const gradientOptions = document.getElementById('gradient-options');
  const padding = document.getElementById('padding');
  const saveButton = document.getElementById('save-image');
  const copyButton = document.getElementById('copy-image');
  const solidColor = document.getElementById('solid-color');
  const gradientStart = document.getElementById('gradient-start');
  const gradientEnd = document.getElementById('gradient-end');
  const colorPresets = document.querySelectorAll('.color-preset');
  const gradientPresets = document.querySelectorAll('.gradient-preset');
  const paddingValue = document.getElementById('padding-value');
  const useWatermarkCheckbox = document.getElementById('use-watermark');
  const watermarkLogoInput = document.getElementById('watermark-logo');
  const saveWatermarkButton = document.getElementById('save-watermark');
  const watermarkOpacity = document.getElementById('watermark-opacity');
  const watermarkOpacityValue = document.getElementById('watermark-opacity-value');

  let pastedImage = null;
  let watermarkLogo = new Image();
  watermarkLogo.src = '/logo.png'; // Default watermark

  // Load saved watermark if exists
  chrome.storage.local.get(['savedWatermark'], function(result) {
    if (result.savedWatermark) {
      watermarkLogo.src = result.savedWatermark;
    }
  });

  pasteArea.addEventListener('paste', handlePaste);
  backgroundType.addEventListener('change', toggleBackgroundOptions);
  saveButton.addEventListener('click', saveImage);
  copyButton.addEventListener('click', copyImage);
  pasteArea.addEventListener('dragover', handleDragOver);
  pasteArea.addEventListener('drop', handleDrop);
  colorPresets.forEach(preset => preset.addEventListener('click', applyColorPreset));
  gradientPresets.forEach(preset => preset.addEventListener('click', applyGradientPreset));
  padding.addEventListener('input', updatePaddingValue);
  watermarkLogoInput.addEventListener('change', handleWatermarkLogoChange);
  saveWatermarkButton.addEventListener('click', saveWatermark);
  solidColor.addEventListener('input', applyBackground);
  gradientStart.addEventListener('input', applyBackground);
  gradientEnd.addEventListener('input', applyBackground);

  watermarkOpacity.addEventListener('input', function() {
    watermarkOpacityValue.textContent = `${watermarkOpacity.value}%`;
    applyBackground();
  });

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

  function applyColorPreset(event) {
    solidColor.value = rgbToHex(event.target.style.backgroundColor);
    backgroundType.value = 'solid';
    toggleBackgroundOptions();
    applyBackground();
  }

  function applyGradientPreset(event) {
    const gradient = event.target.dataset.gradient;
    const colors = gradient.match(/#[a-fA-F0-9]{6}/g);
    if (colors && colors.length >= 2) {
      gradientStart.value = colors[0];
      gradientEnd.value = colors[1];
      backgroundType.value = 'gradient';
      toggleBackgroundOptions();
      applyBackground();
    }
  }

  function updatePaddingValue() {
    paddingValue.textContent = `${padding.value}px`;
    applyBackground();
  }

  function applyBackground() {
    const paddingValue = `${padding.value}px`;
    pasteArea.style.padding = paddingValue;

    if (backgroundType.value === 'gradient') {
      pasteArea.style.background = `linear-gradient(to right, ${gradientStart.value}, ${gradientEnd.value})`;
    } else {
      pasteArea.style.background = solidColor.value;
    }

    if (pastedImage) {
      const aspectRatio = pastedImage.naturalWidth / pastedImage.naturalHeight;
      const availableWidth = pasteArea.clientWidth - (parseInt(padding.value) * 2);
      const availableHeight = pasteArea.clientHeight - (parseInt(padding.value) * 2);
      const availableAspectRatio = availableWidth / availableHeight;

      if (aspectRatio > availableAspectRatio) {
        pastedImage.style.width = `${availableWidth}px`;
        pastedImage.style.height = 'auto';
      } else {
        pastedImage.style.width = 'auto';
        pastedImage.style.height = `${availableHeight}px`;
      }

      pastedImage.style.display = 'block';
      pastedImage.style.margin = 'auto';
    }

    applyWatermark();
  }

  function applyWatermark() {
    const existingWatermark = pasteArea.querySelector('img:not(:first-child)');
    if (existingWatermark) {
      pasteArea.removeChild(existingWatermark);
    }

    if (useWatermarkCheckbox.checked && watermarkLogo && pastedImage) {
      const watermarkImg = watermarkLogo.cloneNode();
      watermarkImg.style.position = 'absolute';
      watermarkImg.style.top = '50%';
      watermarkImg.style.left = '50%';
      watermarkImg.style.transform = 'translate(-50%, -50%)';
      watermarkImg.style.opacity = watermarkOpacity.value / 100;
      watermarkImg.style.maxWidth = '50%';
      watermarkImg.style.maxHeight = '50%';
      pasteArea.appendChild(watermarkImg);
    }
  }

  function handlePaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file') {
        const blob = item.getAsFile();
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            pasteArea.innerHTML = '';
            pasteArea.appendChild(img);
            pastedImage = img;
            applyBackground();
          }
          img.src = e.target.result;
        }

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
        const img = new Image();
        img.onload = function() {
          pasteArea.innerHTML = '';
          pasteArea.appendChild(img);
          pastedImage = img;
          applyBackground();
        }
        img.src = event.target.result;
      }
      reader.readAsDataURL(file);
    }
  }

  function handleWatermarkLogoChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        watermarkLogo = new Image();
        watermarkLogo.onload = function() {
          applyBackground();
        }
        watermarkLogo.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }
  }

  function saveWatermark() {
    if (watermarkLogo.src !== '/logo.png') {
      chrome.storage.local.set({savedWatermark: watermarkLogo.src}, function() {
        alert('Watermark saved successfully!');
      });
    } else {
      alert('Please select a custom watermark image before saving.');
    }
  }

  function saveImage() {
    if (!pastedImage) {
      alert('No image to save!');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 675;

    drawImageOnCanvas(canvas, ctx);

    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'twitter_image.png';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png');
  }

  function copyImage() {
    if (!pastedImage) {
      alert('No image to copy!');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 675;

    drawImageOnCanvas(canvas, ctx);

    canvas.toBlob(function(blob) {
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]).then(function() {
        alert('Image copied to clipboard! You can paste it in other applications.');
      }).catch(function(err) {
        console.error('Could not copy image: ', err);
        alert('Failed to copy image. Please try again or use the Save Image option.');
      });
    }, 'image/png');
  }

  function drawImageOnCanvas(canvas, ctx) {
    if (backgroundType.value === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, gradientStart.value);
      gradient.addColorStop(1, gradientEnd.value);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = solidColor.value;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const paddingValue = parseInt(padding.value);
    const aspectRatio = pastedImage.naturalWidth / pastedImage.naturalHeight;
    const availableWidth = canvas.width - (paddingValue * 2);
    const availableHeight = canvas.height - (paddingValue * 2);
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

    if (useWatermarkCheckbox.checked && watermarkLogo) {
      const logoWidth = canvas.width / 5;
      const logoHeight = logoWidth * (watermarkLogo.naturalHeight / watermarkLogo.naturalWidth);
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = (canvas.height - logoHeight) / 2;
      
      ctx.globalAlpha = parseInt(watermarkOpacity.value) / 100;
      ctx.drawImage(watermarkLogo, logoX, logoY, logoWidth, logoHeight);
      ctx.globalAlpha = 1.0;
    }
  }

  function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g);
    if (rgbValues) {
      return "#" + rgbValues.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }
    return rgb;
  }

  toggleBackgroundOptions();
  updatePaddingValue();
});
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kZWQuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLHVCQUF1QjtBQUNsRTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxFQUFFO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWM7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsY0FBYztBQUMxQztBQUNBO0FBQ0E7QUFDQSxnRUFBZ0Usb0JBQW9CLElBQUksa0JBQWtCO0FBQzFHLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxlQUFlO0FBQ3BEO0FBQ0EsUUFBUTtBQUNSO0FBQ0Esc0NBQXNDLGdCQUFnQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxrQ0FBa0M7QUFDbEU7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxtQkFBbUI7QUFDMUQ7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmFja2dyb3VuZC8uL2V4cGFuZC9leHBhbmRlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgY29uc3QgcGFzdGVBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3RlLWFyZWEnKTtcclxuICBjb25zdCBiYWNrZ3JvdW5kVHlwZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrZ3JvdW5kLXR5cGUnKTtcclxuICBjb25zdCBzb2xpZENvbG9yT3B0aW9ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb2xpZC1jb2xvci1vcHRpb25zJyk7XHJcbiAgY29uc3QgZ3JhZGllbnRPcHRpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyYWRpZW50LW9wdGlvbnMnKTtcclxuICBjb25zdCBwYWRkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZGRpbmcnKTtcclxuICBjb25zdCBzYXZlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhdmUtaW1hZ2UnKTtcclxuICBjb25zdCBjb3B5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvcHktaW1hZ2UnKTtcclxuICBjb25zdCBzb2xpZENvbG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvbGlkLWNvbG9yJyk7XHJcbiAgY29uc3QgZ3JhZGllbnRTdGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncmFkaWVudC1zdGFydCcpO1xyXG4gIGNvbnN0IGdyYWRpZW50RW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyYWRpZW50LWVuZCcpO1xyXG4gIGNvbnN0IGNvbG9yUHJlc2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb2xvci1wcmVzZXQnKTtcclxuICBjb25zdCBncmFkaWVudFByZXNldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ3JhZGllbnQtcHJlc2V0Jyk7XHJcbiAgY29uc3QgcGFkZGluZ1ZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZGRpbmctdmFsdWUnKTtcclxuICBjb25zdCB1c2VXYXRlcm1hcmtDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2Utd2F0ZXJtYXJrJyk7XHJcbiAgY29uc3Qgd2F0ZXJtYXJrTG9nb0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhdGVybWFyay1sb2dvJyk7XHJcbiAgY29uc3Qgc2F2ZVdhdGVybWFya0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYXZlLXdhdGVybWFyaycpO1xyXG4gIGNvbnN0IHdhdGVybWFya09wYWNpdHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2F0ZXJtYXJrLW9wYWNpdHknKTtcclxuICBjb25zdCB3YXRlcm1hcmtPcGFjaXR5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2F0ZXJtYXJrLW9wYWNpdHktdmFsdWUnKTtcclxuXHJcbiAgbGV0IHBhc3RlZEltYWdlID0gbnVsbDtcclxuICBsZXQgd2F0ZXJtYXJrTG9nbyA9IG5ldyBJbWFnZSgpO1xyXG4gIHdhdGVybWFya0xvZ28uc3JjID0gJy9sb2dvLnBuZyc7IC8vIERlZmF1bHQgd2F0ZXJtYXJrXHJcblxyXG4gIC8vIExvYWQgc2F2ZWQgd2F0ZXJtYXJrIGlmIGV4aXN0c1xyXG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3NhdmVkV2F0ZXJtYXJrJ10sIGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgaWYgKHJlc3VsdC5zYXZlZFdhdGVybWFyaykge1xyXG4gICAgICB3YXRlcm1hcmtMb2dvLnNyYyA9IHJlc3VsdC5zYXZlZFdhdGVybWFyaztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcGFzdGVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ3Bhc3RlJywgaGFuZGxlUGFzdGUpO1xyXG4gIGJhY2tncm91bmRUeXBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRvZ2dsZUJhY2tncm91bmRPcHRpb25zKTtcclxuICBzYXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUltYWdlKTtcclxuICBjb3B5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY29weUltYWdlKTtcclxuICBwYXN0ZUFyZWEuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCBoYW5kbGVEcmFnT3Zlcik7XHJcbiAgcGFzdGVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBoYW5kbGVEcm9wKTtcclxuICBjb2xvclByZXNldHMuZm9yRWFjaChwcmVzZXQgPT4gcHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwbHlDb2xvclByZXNldCkpO1xyXG4gIGdyYWRpZW50UHJlc2V0cy5mb3JFYWNoKHByZXNldCA9PiBwcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhcHBseUdyYWRpZW50UHJlc2V0KSk7XHJcbiAgcGFkZGluZy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHVwZGF0ZVBhZGRpbmdWYWx1ZSk7XHJcbiAgd2F0ZXJtYXJrTG9nb0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZVdhdGVybWFya0xvZ29DaGFuZ2UpO1xyXG4gIHNhdmVXYXRlcm1hcmtCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlV2F0ZXJtYXJrKTtcclxuICBzb2xpZENvbG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgYXBwbHlCYWNrZ3JvdW5kKTtcclxuICBncmFkaWVudFN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgYXBwbHlCYWNrZ3JvdW5kKTtcclxuICBncmFkaWVudEVuZC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGFwcGx5QmFja2dyb3VuZCk7XHJcblxyXG4gIHdhdGVybWFya09wYWNpdHkuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgIHdhdGVybWFya09wYWNpdHlWYWx1ZS50ZXh0Q29udGVudCA9IGAke3dhdGVybWFya09wYWNpdHkudmFsdWV9JWA7XHJcbiAgICBhcHBseUJhY2tncm91bmQoKTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gdG9nZ2xlQmFja2dyb3VuZE9wdGlvbnMoKSB7XHJcbiAgICBpZiAoYmFja2dyb3VuZFR5cGUudmFsdWUgPT09ICdncmFkaWVudCcpIHtcclxuICAgICAgZ3JhZGllbnRPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICBzb2xpZENvbG9yT3B0aW9ucy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZ3JhZGllbnRPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIHNvbGlkQ29sb3JPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG4gICAgYXBwbHlCYWNrZ3JvdW5kKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseUNvbG9yUHJlc2V0KGV2ZW50KSB7XHJcbiAgICBzb2xpZENvbG9yLnZhbHVlID0gcmdiVG9IZXgoZXZlbnQudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvcik7XHJcbiAgICBiYWNrZ3JvdW5kVHlwZS52YWx1ZSA9ICdzb2xpZCc7XHJcbiAgICB0b2dnbGVCYWNrZ3JvdW5kT3B0aW9ucygpO1xyXG4gICAgYXBwbHlCYWNrZ3JvdW5kKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseUdyYWRpZW50UHJlc2V0KGV2ZW50KSB7XHJcbiAgICBjb25zdCBncmFkaWVudCA9IGV2ZW50LnRhcmdldC5kYXRhc2V0LmdyYWRpZW50O1xyXG4gICAgY29uc3QgY29sb3JzID0gZ3JhZGllbnQubWF0Y2goLyNbYS1mQS1GMC05XXs2fS9nKTtcclxuICAgIGlmIChjb2xvcnMgJiYgY29sb3JzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgIGdyYWRpZW50U3RhcnQudmFsdWUgPSBjb2xvcnNbMF07XHJcbiAgICAgIGdyYWRpZW50RW5kLnZhbHVlID0gY29sb3JzWzFdO1xyXG4gICAgICBiYWNrZ3JvdW5kVHlwZS52YWx1ZSA9ICdncmFkaWVudCc7XHJcbiAgICAgIHRvZ2dsZUJhY2tncm91bmRPcHRpb25zKCk7XHJcbiAgICAgIGFwcGx5QmFja2dyb3VuZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlUGFkZGluZ1ZhbHVlKCkge1xyXG4gICAgcGFkZGluZ1ZhbHVlLnRleHRDb250ZW50ID0gYCR7cGFkZGluZy52YWx1ZX1weGA7XHJcbiAgICBhcHBseUJhY2tncm91bmQoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFwcGx5QmFja2dyb3VuZCgpIHtcclxuICAgIGNvbnN0IHBhZGRpbmdWYWx1ZSA9IGAke3BhZGRpbmcudmFsdWV9cHhgO1xyXG4gICAgcGFzdGVBcmVhLnN0eWxlLnBhZGRpbmcgPSBwYWRkaW5nVmFsdWU7XHJcblxyXG4gICAgaWYgKGJhY2tncm91bmRUeXBlLnZhbHVlID09PSAnZ3JhZGllbnQnKSB7XHJcbiAgICAgIHBhc3RlQXJlYS5zdHlsZS5iYWNrZ3JvdW5kID0gYGxpbmVhci1ncmFkaWVudCh0byByaWdodCwgJHtncmFkaWVudFN0YXJ0LnZhbHVlfSwgJHtncmFkaWVudEVuZC52YWx1ZX0pYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBhc3RlQXJlYS5zdHlsZS5iYWNrZ3JvdW5kID0gc29saWRDb2xvci52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocGFzdGVkSW1hZ2UpIHtcclxuICAgICAgY29uc3QgYXNwZWN0UmF0aW8gPSBwYXN0ZWRJbWFnZS5uYXR1cmFsV2lkdGggLyBwYXN0ZWRJbWFnZS5uYXR1cmFsSGVpZ2h0O1xyXG4gICAgICBjb25zdCBhdmFpbGFibGVXaWR0aCA9IHBhc3RlQXJlYS5jbGllbnRXaWR0aCAtIChwYXJzZUludChwYWRkaW5nLnZhbHVlKSAqIDIpO1xyXG4gICAgICBjb25zdCBhdmFpbGFibGVIZWlnaHQgPSBwYXN0ZUFyZWEuY2xpZW50SGVpZ2h0IC0gKHBhcnNlSW50KHBhZGRpbmcudmFsdWUpICogMik7XHJcbiAgICAgIGNvbnN0IGF2YWlsYWJsZUFzcGVjdFJhdGlvID0gYXZhaWxhYmxlV2lkdGggLyBhdmFpbGFibGVIZWlnaHQ7XHJcblxyXG4gICAgICBpZiAoYXNwZWN0UmF0aW8gPiBhdmFpbGFibGVBc3BlY3RSYXRpbykge1xyXG4gICAgICAgIHBhc3RlZEltYWdlLnN0eWxlLndpZHRoID0gYCR7YXZhaWxhYmxlV2lkdGh9cHhgO1xyXG4gICAgICAgIHBhc3RlZEltYWdlLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwYXN0ZWRJbWFnZS5zdHlsZS53aWR0aCA9ICdhdXRvJztcclxuICAgICAgICBwYXN0ZWRJbWFnZS5zdHlsZS5oZWlnaHQgPSBgJHthdmFpbGFibGVIZWlnaHR9cHhgO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXN0ZWRJbWFnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgcGFzdGVkSW1hZ2Uuc3R5bGUubWFyZ2luID0gJ2F1dG8nO1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5V2F0ZXJtYXJrKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseVdhdGVybWFyaygpIHtcclxuICAgIGNvbnN0IGV4aXN0aW5nV2F0ZXJtYXJrID0gcGFzdGVBcmVhLnF1ZXJ5U2VsZWN0b3IoJ2ltZzpub3QoOmZpcnN0LWNoaWxkKScpO1xyXG4gICAgaWYgKGV4aXN0aW5nV2F0ZXJtYXJrKSB7XHJcbiAgICAgIHBhc3RlQXJlYS5yZW1vdmVDaGlsZChleGlzdGluZ1dhdGVybWFyayk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHVzZVdhdGVybWFya0NoZWNrYm94LmNoZWNrZWQgJiYgd2F0ZXJtYXJrTG9nbyAmJiBwYXN0ZWRJbWFnZSkge1xyXG4gICAgICBjb25zdCB3YXRlcm1hcmtJbWcgPSB3YXRlcm1hcmtMb2dvLmNsb25lTm9kZSgpO1xyXG4gICAgICB3YXRlcm1hcmtJbWcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICB3YXRlcm1hcmtJbWcuc3R5bGUudG9wID0gJzUwJSc7XHJcbiAgICAgIHdhdGVybWFya0ltZy5zdHlsZS5sZWZ0ID0gJzUwJSc7XHJcbiAgICAgIHdhdGVybWFya0ltZy5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJztcclxuICAgICAgd2F0ZXJtYXJrSW1nLnN0eWxlLm9wYWNpdHkgPSB3YXRlcm1hcmtPcGFjaXR5LnZhbHVlIC8gMTAwO1xyXG4gICAgICB3YXRlcm1hcmtJbWcuc3R5bGUubWF4V2lkdGggPSAnNTAlJztcclxuICAgICAgd2F0ZXJtYXJrSW1nLnN0eWxlLm1heEhlaWdodCA9ICc1MCUnO1xyXG4gICAgICBwYXN0ZUFyZWEuYXBwZW5kQ2hpbGQod2F0ZXJtYXJrSW1nKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZVBhc3RlKGV2ZW50KSB7XHJcbiAgICBjb25zdCBpdGVtcyA9IChldmVudC5jbGlwYm9hcmREYXRhIHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2xpcGJvYXJkRGF0YSkuaXRlbXM7XHJcbiAgICBmb3IgKGxldCBpbmRleCBpbiBpdGVtcykge1xyXG4gICAgICBjb25zdCBpdGVtID0gaXRlbXNbaW5kZXhdO1xyXG4gICAgICBpZiAoaXRlbS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICBjb25zdCBibG9iID0gaXRlbS5nZXRBc0ZpbGUoKTtcclxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcGFzdGVBcmVhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICBwYXN0ZUFyZWEuYXBwZW5kQ2hpbGQoaW1nKTtcclxuICAgICAgICAgICAgcGFzdGVkSW1hZ2UgPSBpbWc7XHJcbiAgICAgICAgICAgIGFwcGx5QmFja2dyb3VuZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaW1nLnNyYyA9IGUudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVEcmFnT3ZlcihlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRHJvcChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgY29uc3QgZmlsZSA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzWzBdO1xyXG4gICAgaWYgKGZpbGUgJiYgZmlsZS50eXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XHJcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHBhc3RlQXJlYS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgIHBhc3RlQXJlYS5hcHBlbmRDaGlsZChpbWcpO1xyXG4gICAgICAgICAgcGFzdGVkSW1hZ2UgPSBpbWc7XHJcbiAgICAgICAgICBhcHBseUJhY2tncm91bmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW1nLnNyYyA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVXYXRlcm1hcmtMb2dvQ2hhbmdlKGV2ZW50KSB7XHJcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgaWYgKGZpbGUpIHtcclxuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB3YXRlcm1hcmtMb2dvID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgd2F0ZXJtYXJrTG9nby5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGFwcGx5QmFja2dyb3VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3YXRlcm1hcmtMb2dvLnNyYyA9IGUudGFyZ2V0LnJlc3VsdDtcclxuICAgICAgfVxyXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNhdmVXYXRlcm1hcmsoKSB7XHJcbiAgICBpZiAod2F0ZXJtYXJrTG9nby5zcmMgIT09ICcvbG9nby5wbmcnKSB7XHJcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7c2F2ZWRXYXRlcm1hcms6IHdhdGVybWFya0xvZ28uc3JjfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgYWxlcnQoJ1dhdGVybWFyayBzYXZlZCBzdWNjZXNzZnVsbHkhJyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ1BsZWFzZSBzZWxlY3QgYSBjdXN0b20gd2F0ZXJtYXJrIGltYWdlIGJlZm9yZSBzYXZpbmcuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzYXZlSW1hZ2UoKSB7XHJcbiAgICBpZiAoIXBhc3RlZEltYWdlKSB7XHJcbiAgICAgIGFsZXJ0KCdObyBpbWFnZSB0byBzYXZlIScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAxMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDY3NTtcclxuXHJcbiAgICBkcmF3SW1hZ2VPbkNhbnZhcyhjYW52YXMsIGN0eCk7XHJcblxyXG4gICAgY2FudmFzLnRvQmxvYihmdW5jdGlvbihibG9iKSB7XHJcbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICAgIGNvbnN0IGRvd25sb2FkTGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgZG93bmxvYWRMaW5rLmhyZWYgPSB1cmw7XHJcbiAgICAgIGRvd25sb2FkTGluay5kb3dubG9hZCA9ICd0d2l0dGVyX2ltYWdlLnBuZyc7XHJcbiAgICAgIFxyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvd25sb2FkTGluayk7XHJcbiAgICAgIGRvd25sb2FkTGluay5jbGljaygpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvd25sb2FkTGluayk7XHJcblxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IFVSTC5yZXZva2VPYmplY3RVUkwodXJsKSwgMTAwKTtcclxuICAgIH0sICdpbWFnZS9wbmcnKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvcHlJbWFnZSgpIHtcclxuICAgIGlmICghcGFzdGVkSW1hZ2UpIHtcclxuICAgICAgYWxlcnQoJ05vIGltYWdlIHRvIGNvcHkhJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIGNhbnZhcy53aWR0aCA9IDEyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gNjc1O1xyXG5cclxuICAgIGRyYXdJbWFnZU9uQ2FudmFzKGNhbnZhcywgY3R4KTtcclxuXHJcbiAgICBjYW52YXMudG9CbG9iKGZ1bmN0aW9uKGJsb2IpIHtcclxuICAgICAgY29uc3QgaXRlbSA9IG5ldyBDbGlwYm9hcmRJdGVtKHsgJ2ltYWdlL3BuZyc6IGJsb2IgfSk7XHJcbiAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoW2l0ZW1dKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFsZXJ0KCdJbWFnZSBjb3BpZWQgdG8gY2xpcGJvYXJkISBZb3UgY2FuIHBhc3RlIGl0IGluIG90aGVyIGFwcGxpY2F0aW9ucy4nKTtcclxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNvcHkgaW1hZ2U6ICcsIGVycik7XHJcbiAgICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IGltYWdlLiBQbGVhc2UgdHJ5IGFnYWluIG9yIHVzZSB0aGUgU2F2ZSBJbWFnZSBvcHRpb24uJyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSwgJ2ltYWdlL3BuZycpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZHJhd0ltYWdlT25DYW52YXMoY2FudmFzLCBjdHgpIHtcclxuICAgIGlmIChiYWNrZ3JvdW5kVHlwZS52YWx1ZSA9PT0gJ2dyYWRpZW50Jykge1xyXG4gICAgICBjb25zdCBncmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgZ3JhZGllbnRTdGFydC52YWx1ZSk7XHJcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCBncmFkaWVudEVuZC52YWx1ZSk7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBzb2xpZENvbG9yLnZhbHVlO1xyXG4gICAgfVxyXG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgY29uc3QgcGFkZGluZ1ZhbHVlID0gcGFyc2VJbnQocGFkZGluZy52YWx1ZSk7XHJcbiAgICBjb25zdCBhc3BlY3RSYXRpbyA9IHBhc3RlZEltYWdlLm5hdHVyYWxXaWR0aCAvIHBhc3RlZEltYWdlLm5hdHVyYWxIZWlnaHQ7XHJcbiAgICBjb25zdCBhdmFpbGFibGVXaWR0aCA9IGNhbnZhcy53aWR0aCAtIChwYWRkaW5nVmFsdWUgKiAyKTtcclxuICAgIGNvbnN0IGF2YWlsYWJsZUhlaWdodCA9IGNhbnZhcy5oZWlnaHQgLSAocGFkZGluZ1ZhbHVlICogMik7XHJcbiAgICBjb25zdCBhdmFpbGFibGVBc3BlY3RSYXRpbyA9IGF2YWlsYWJsZVdpZHRoIC8gYXZhaWxhYmxlSGVpZ2h0O1xyXG5cclxuICAgIGxldCBkcmF3V2lkdGgsIGRyYXdIZWlnaHQ7XHJcbiAgICBpZiAoYXNwZWN0UmF0aW8gPiBhdmFpbGFibGVBc3BlY3RSYXRpbykge1xyXG4gICAgICBkcmF3V2lkdGggPSBhdmFpbGFibGVXaWR0aDtcclxuICAgICAgZHJhd0hlaWdodCA9IGRyYXdXaWR0aCAvIGFzcGVjdFJhdGlvO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZHJhd0hlaWdodCA9IGF2YWlsYWJsZUhlaWdodDtcclxuICAgICAgZHJhd1dpZHRoID0gZHJhd0hlaWdodCAqIGFzcGVjdFJhdGlvO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRyYXdYID0gKGNhbnZhcy53aWR0aCAtIGRyYXdXaWR0aCkgLyAyO1xyXG4gICAgY29uc3QgZHJhd1kgPSAoY2FudmFzLmhlaWdodCAtIGRyYXdIZWlnaHQpIC8gMjtcclxuICAgIGN0eC5kcmF3SW1hZ2UocGFzdGVkSW1hZ2UsIGRyYXdYLCBkcmF3WSwgZHJhd1dpZHRoLCBkcmF3SGVpZ2h0KTtcclxuXHJcbiAgICBpZiAodXNlV2F0ZXJtYXJrQ2hlY2tib3guY2hlY2tlZCAmJiB3YXRlcm1hcmtMb2dvKSB7XHJcbiAgICAgIGNvbnN0IGxvZ29XaWR0aCA9IGNhbnZhcy53aWR0aCAvIDU7XHJcbiAgICAgIGNvbnN0IGxvZ29IZWlnaHQgPSBsb2dvV2lkdGggKiAod2F0ZXJtYXJrTG9nby5uYXR1cmFsSGVpZ2h0IC8gd2F0ZXJtYXJrTG9nby5uYXR1cmFsV2lkdGgpO1xyXG4gICAgICBjb25zdCBsb2dvWCA9IChjYW52YXMud2lkdGggLSBsb2dvV2lkdGgpIC8gMjtcclxuICAgICAgY29uc3QgbG9nb1kgPSAoY2FudmFzLmhlaWdodCAtIGxvZ29IZWlnaHQpIC8gMjtcclxuICAgICAgXHJcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHBhcnNlSW50KHdhdGVybWFya09wYWNpdHkudmFsdWUpIC8gMTAwO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKHdhdGVybWFya0xvZ28sIGxvZ29YLCBsb2dvWSwgbG9nb1dpZHRoLCBsb2dvSGVpZ2h0KTtcclxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMS4wO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmdiVG9IZXgocmdiKSB7XHJcbiAgICBjb25zdCByZ2JWYWx1ZXMgPSByZ2IubWF0Y2goL1xcZCsvZyk7XHJcbiAgICBpZiAocmdiVmFsdWVzKSB7XHJcbiAgICAgIHJldHVybiBcIiNcIiArIHJnYlZhbHVlcy5tYXAoeCA9PiBwYXJzZUludCh4KS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmdiO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlQmFja2dyb3VuZE9wdGlvbnMoKTtcclxuICB1cGRhdGVQYWRkaW5nVmFsdWUoKTtcclxufSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9