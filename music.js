  // small UI interactions
    document.getElementById('year').textContent = new Date().getFullYear();

    // Lightbox gallery
    document.querySelectorAll('.gallery img').forEach(img => {
      img.addEventListener('click', () => {
        const lb = document.getElementById('lightbox');
        document.getElementById('lightImg').src = img.src;
        lb.style.display = 'flex'; lb.setAttribute('aria-hidden','false');
      });
    });
    document.getElementById('closeLight').addEventListener('click', ()=>{
      const lb = document.getElementById('lightbox'); lb.style.display='none'; lb.setAttribute('aria-hidden','true');
    });

    // Audio sample (demo only)
    const audio = document.getElementById('sampleAudio');
    const playBtn = document.getElementById('playBtn');
    const meter = document.getElementById('meter');
    let playing = false;
    playBtn.addEventListener('click', ()=>{
      // This sample audio src is a placeholder. Replace the <audio> src with a real file to enable playback.
      if(!audio.src || audio.src.includes('simple-mock-audio.example')){
        alert('Sample audio is a placeholder. Replace the audio src in the HTML with your file.');
        return;
      }
      if(!playing){audio.play(); playBtn.textContent='⏸'; playing=true;} else {audio.pause(); playBtn.textContent='▶'; playing=false}
    });

    // Booking form (client-side demonstration)
    document.getElementById('submitBooking').addEventListener('click', ()=>{
      const name = document.getElementById('name').value.trim();
      const date = document.getElementById('date').value;
      const hours = document.getElementById('hours').value;
      const msg = document.getElementById('bookingMsg');
      if(!name || !date){ msg.textContent='Please fill your name and date.'; return; }
      msg.textContent = `Thanks ${name}! We've received your booking request for ${date} (${hours} hr). We'll follow up by email.`;
      // In production: POST this data to your server or trigger an email via a backend service.
    });

    // Contact form (client-side demo)
    document.getElementById('sendMsg').addEventListener('click', ()=>{
      const cn = document.getElementById('cname').value.trim();
      const ce = document.getElementById('cemail').value.trim();
      const cm = document.getElementById('cmsg').value.trim();
      const cmsg = document.getElementById('contactMsg');
      if(!cn || !ce || !cm){ cmsg.textContent='Please fill all fields.'; return; }
      cmsg.textContent = 'Message sent! We will reply to ' + ce + ' soon.';
      // For live sites: send this to your backend or an email API.
    });

    // Listen samples CTA
    document.getElementById('listenSamples').addEventListener('click', ()=>{
      // in a live project you might open a player or scroll to a samples section.
      alert('Samples are available upon request. Replace the sample audio src in the HTML to provide direct playback.');
    });

    // small visual meter pulse (just decorative)
    setInterval(()=>{
      const w = Math.floor(30 + Math.random()*70);
      meter.style.width = w + 'px';
    }, 420);
