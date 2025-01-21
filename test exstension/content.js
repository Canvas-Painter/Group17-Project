const iframe = document.createElement('iframe');
iframe.src = 'https://www.wikipedia.org'; // URL
iframe.style.position = 'fixed';
iframe.style.bottom = '20px'; 
iframe.style.left = '50%';
iframe.style.transform = 'translateX(-50%)';
iframe.style.width = '400px';
iframe.style.height = '300px';
iframe.style.border = '2px solid #ccc';
iframe.style.zIndex = '9999';

document.body.appendChild(iframe);
