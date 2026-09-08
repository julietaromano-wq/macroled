  (function(){
    // =====================================================================
    // Config de integración con n8n
    // =====================================================================
    var MC_WEBHOOK_URL = 'https://n8n.coresagroup.com/webhook/formularios-macroled';

    // Mapa: valor del <select name="tipo_consulta"> -> origenValor exacto
    // que espera el nodo Switch, y armado del objeto "data" según el
    // nodo "Set" de ese branch (nombres de clave EXACTOS, no tocar).
    //
    // ⚠️ "asesoramiento-luminico" y "rrhh" son mi mejor estimación
    // siguiendo el patrón kebab-case de los otros 3 (consultas-tecnicas,
    // consultas-comerciales, garantia). Confirmá los valores reales de
    // Routing Rule 4 y 5 del nodo Switch y, si difieren, cambiá solo
    // estas dos líneas de "origen" más abajo.
    var MC_BRANCH_CONFIG = {
      tecnica: {
        origen: 'consultas-tecnicas',
        buildData: function(f){
          return {
            Nombre: f.nombre,
            Lugar: f.ciudad,
            Provincia: f.provincia,
            Email: f.email,
            Telefono: f.telefono,
            Comentario: f.comentarios
          };
        }
      },
      comercial: {
        origen: 'consultas-comerciales',
        buildData: function(f){
          return {
            Nombre: f.nombre,
            Lugar: f.ciudad,
            Provincia: f.provincia,
            Email: f.email,
            Telefono: f.telefono,
            Comentario: f.comentarios
          };
        }
      },
      garantia: {
        origen: 'garantia',
        buildData: function(f){
          return {
            Nombre: f.nombre,
            Ciudad: f.ciudad,
            Comercio: f.nombre_comercio,
            Provincia: f.provincia,
            Email: f.email,
            Telefono: f.telefono,
            Comentario: f.comentarios,
            Archivo: f.archivo || ''
          };
        }
      },
      asesoramiento: {
        origen: 'asesoramiento-luminico',
        buildData: function(f){
          return {
            Nombre: f.nombre,
            // El Set "Asesoramiento Luminico" espera "Cliente" y el form
            // unificado no tiene ese campo propio: le mando el mismo
            // valor que Nombre en vez de dejarlo vacío.
            Cliente: f.nombre,
            Provincia: f.provincia,
            Producto: f.tipo_producto,
            Telefono: f.telefono,
            Comentario: f.comentarios,
            Archivo: f.archivo || ''
            // Nota: este Set node no lee Email ni Ciudad/Lugar. Ya se
            // mandan en el payload igual (ver Email/Ciudad más abajo en
            // "data" no incluidos acá) — para que lleguen a destino hace
            // falta agregar esas 2 líneas al Set node en n8n:
            //   Email: {{ $json.body.payload.data.Email }}
            //   Ciudad: {{ $json.body.payload.data.Ciudad }}
          };
        }
      },
      'trabaja-con-nosotros': {
        origen: 'rrhh',
        buildData: function(f){
          return {
            // Nota: la clave real tiene espacio y se lee con corchetes
            // en el Set node: $json.body.payload.data['Nombre Completo']
            'Nombre Completo': f.nombre,
            // El Set "RRHH" espera Domicilio y Localidad como campos
            // separados; el form unificado solo pide una "Ciudad", así
            // que mando el mismo valor a ambos.
            Domicilio: f.ciudad,
            Provincia: f.provincia,
            Localidad: f.ciudad,
            // Ahora sí tiene campo propio en el form ("Área a la que
            // aplica"), ya no queda vacío.
            Area: f.area_interes,
            Email: f.email,
            Telefono: f.telefono,
            Archivo: f.archivo || ''
          };
        }
      }
    };

    function fileToBase64(file){
      return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){ resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function initCustomSelect(wrap){
      const select = wrap.querySelector('select');
      if(!select || wrap.dataset.enhanced === '1') return;
      wrap.dataset.enhanced = '1';
      select.classList.add('mc-select-native');
      select.tabIndex = -1;
      select.setAttribute('aria-hidden', 'true');

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'mc-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', select.id + '-menu');
      const label = document.querySelector('label[for="' + select.id + '"]');
      if(label) trigger.setAttribute('aria-label', label.textContent.trim());
      if(document.getElementById(select.id + '-error')) trigger.setAttribute('aria-describedby', select.id + '-error');
      trigger.innerHTML = '<span class="mc-select-trigger-text"></span><svg class="mc-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      const menu = document.createElement('div');
      menu.className = 'mc-select-menu';
      menu.id = select.id + '-menu';
      menu.setAttribute('role', 'listbox');

      const labelText = trigger.querySelector('.mc-select-trigger-text');

      function syncFromSelect(){
        const selected = select.options[select.selectedIndex];
        const isPlaceholder = !selected || selected.disabled || selected.value === '';
        labelText.textContent = selected ? selected.textContent : '';
        trigger.setAttribute('aria-label', (label ? label.textContent.trim() + ': ' : '') + labelText.textContent);
        trigger.classList.toggle('is-placeholder', isPlaceholder);
        menu.querySelectorAll('.mc-select-option').forEach(function(btn){
          btn.classList.toggle('is-active', btn.dataset.value === select.value && select.value !== '');
        });
      }

      function closeMenu(){
        wrap.classList.remove('mc-select-open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      function openMenu(){
        document.querySelectorAll('.mc-select-wrap.mc-select-open').forEach(function(other){
          if(other !== wrap) other.classList.remove('mc-select-open');
        });
        wrap.classList.add('mc-select-open');
        trigger.setAttribute('aria-expanded', 'true');
      }

      Array.prototype.forEach.call(select.options, function(opt){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mc-select-option';
        btn.textContent = opt.textContent;
        btn.dataset.value = opt.value;
        if(opt.disabled) btn.disabled = true;
        btn.addEventListener('click', function(){
          if(opt.disabled) return;
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          syncFromSelect();
          closeMenu();
        });
        menu.appendChild(btn);
      });

      function focusOption(el){
        if(el) el.focus();
      }

      function firstEnabledOption(){
        return Array.prototype.find.call(menu.children, function(btn){ return !btn.disabled; });
      }

      function lastEnabledOption(){
        const opts = Array.prototype.filter.call(menu.children, function(btn){ return !btn.disabled; });
        return opts[opts.length - 1];
      }

      function siblingEnabledOption(current, direction){
        const opts = Array.prototype.filter.call(menu.children, function(btn){ return !btn.disabled; });
        const idx = opts.indexOf(current);
        if(idx === -1) return direction > 0 ? firstEnabledOption() : lastEnabledOption();
        const next = opts[idx + direction];
        return next || current;
      }

      trigger.addEventListener('click', function(e){
        e.preventDefault();
        if(wrap.classList.contains('mc-select-open')) closeMenu();
        else openMenu();
      });

      trigger.addEventListener('keydown', function(e){
        if(e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        openMenu();
        const active = menu.querySelector('.mc-select-option.is-active');
        focusOption(active || firstEnabledOption());
      });

      menu.addEventListener('keydown', function(e){
        const current = e.target.closest('.mc-select-option');
        if(!current) return;
        if(e.key === 'ArrowDown'){
          e.preventDefault();
          focusOption(siblingEnabledOption(current, 1));
        } else if(e.key === 'ArrowUp'){
          e.preventDefault();
          focusOption(siblingEnabledOption(current, -1));
        } else if(e.key === 'Home'){
          e.preventDefault();
          focusOption(firstEnabledOption());
        } else if(e.key === 'End'){
          e.preventDefault();
          focusOption(lastEnabledOption());
        } else if(e.key === 'Escape'){
          closeMenu();
          trigger.focus();
        } else if(e.key === 'Tab'){
          closeMenu();
        }
      });

      wrap.appendChild(trigger);
      wrap.appendChild(menu);
      syncFromSelect();
      select.addEventListener('change', syncFromSelect);
    }

    document.querySelectorAll('.mc-select-wrap').forEach(initCustomSelect);

    document.addEventListener('click', function(e){
      if(!e.target.closest('.mc-select-wrap')){
        document.querySelectorAll('.mc-select-wrap.mc-select-open').forEach(function(wrap){
          wrap.classList.remove('mc-select-open');
        });
      }
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        document.querySelectorAll('.mc-select-wrap.mc-select-open').forEach(function(wrap){
          wrap.classList.remove('mc-select-open');
        });
      }
    });

    const tipoSelect = document.getElementById('mc-tipo-consulta');
    const provinciaSelect = document.getElementById('mc-provincia');
    const conditionalBlocks = document.querySelectorAll('.mc-conditional');
    const uploadField = document.getElementById('mc-upload-field');
    const uploadZone = document.getElementById('mc-upload-zone');
    const uploadInput = document.getElementById('mc-archivo');
    const uploadLabel = document.getElementById('mc-upload-label');
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const uploadTypes = ['garantia', 'asesoramiento', 'trabaja-con-nosotros'];

    const uploadConfig = {
      garantia: {
        label: 'Ticket o factura',
        optional: false,
        accept: 'image/*,.pdf'
      },
      asesoramiento: {
        label: 'Imagen de referencia',
        optional: true,
        accept: 'image/*'
      },
      'trabaja-con-nosotros': {
        label: 'CV',
        optional: false,
        accept: '.pdf,.doc,.docx,application/pdf'
      }
    };

    function updateUploadConfig(value){
      const showUpload = uploadTypes.includes(value);
      uploadField.classList.toggle('mc-active', showUpload);
      if(!showUpload){
        resetUploadZone(uploadZone);
        return;
      }
      const config = uploadConfig[value];
      uploadLabel.innerHTML = config.optional
        ? config.label + ' <span>(opcional)</span>'
        : config.label;
      uploadInput.accept = config.accept;
    }

    function formatSize(bytes){
      if(bytes < 1024) return bytes + ' B';
      if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function resetUploadZone(zone){
      const input = zone.querySelector('input[type="file"]');
      const preview = zone.querySelector('.mc-upload-preview');
      const thumb = zone.querySelector('.mc-upload-thumb');
      const fileIcon = zone.querySelector('.mc-upload-file-icon');
      input.value = '';
      zone.classList.remove('mc-has-file');
      thumb.hidden = true;
      thumb.removeAttribute('src');
      fileIcon.hidden = true;
      preview.querySelector('.mc-upload-name').textContent = '';
      preview.querySelector('.mc-upload-size').textContent = '';
    }

    function updateUploadZone(zone, file){
      const preview = zone.querySelector('.mc-upload-preview');
      const thumb = zone.querySelector('.mc-upload-thumb');
      const fileIcon = zone.querySelector('.mc-upload-file-icon');
      const nameEl = preview.querySelector('.mc-upload-name');
      const sizeEl = preview.querySelector('.mc-upload-size');

      if(!file){
        resetUploadZone(zone);
        return;
      }

      if(file.size > MAX_FILE_SIZE){
        alert('El archivo supera el máximo de 10 MB.');
        resetUploadZone(zone);
        return;
      }

      zone.classList.add('mc-has-file');
      nameEl.textContent = file.name;
      sizeEl.textContent = formatSize(file.size);

      if(file.type.startsWith('image/')){
        const reader = new FileReader();
        reader.onload = function(e){
          thumb.src = e.target.result;
          thumb.hidden = false;
          fileIcon.hidden = true;
        };
        reader.readAsDataURL(file);
      } else {
        thumb.hidden = true;
        thumb.removeAttribute('src');
        fileIcon.hidden = false;
      }
    }

    function initUploadZone(zone){
      const input = zone.querySelector('input[type="file"]');
      const removeBtn = zone.querySelector('.mc-upload-remove');

      input.addEventListener('change', function(){
        updateUploadZone(zone, input.files[0] || null);
      });

      removeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        resetUploadZone(zone);
      });

      ['dragenter', 'dragover'].forEach(function(evt){
        zone.addEventListener(evt, function(e){
          e.preventDefault();
          zone.classList.add('mc-upload-drag');
        });
      });
      ['dragleave', 'drop'].forEach(function(evt){
        zone.addEventListener(evt, function(e){
          e.preventDefault();
          zone.classList.remove('mc-upload-drag');
        });
      });
      zone.addEventListener('drop', function(e){
        const file = e.dataTransfer.files[0];
        if(!file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        updateUploadZone(zone, file);
      });
    }

    document.querySelectorAll('[data-upload]').forEach(initUploadZone);

    function updateConditionals(value){
      conditionalBlocks.forEach(function(block){
        const isActive = block.getAttribute('data-shows-for') === value;
        block.classList.toggle('mc-active', isActive);
        if(!isActive){
          block.querySelectorAll('input:not([type="file"]), select').forEach(function(el){
            el.value = '';
          });
        }
      });
      updateUploadConfig(value);
    }

    updateUploadConfig(tipoSelect.value);

    tipoSelect.addEventListener('change', function(){
      updateConditionals(tipoSelect.value);
    });

    function setSelectValidity(select, isValid){
      const wrap = select.closest('.mc-select-wrap');
      const pill = select.closest('.mc-pill');
      const trigger = wrap ? wrap.querySelector('.mc-select-trigger') : null;
      const error = document.getElementById(select.id + '-error');
      if(pill) pill.classList.toggle('mc-invalid', !isValid);
      if(trigger) trigger.setAttribute('aria-invalid', String(!isValid));
      if(error) error.classList.toggle('mc-active', !isValid);
      return isValid;
    }

    [tipoSelect, provinciaSelect].forEach(function(select){
      select.addEventListener('change', function(){
        if(select.value) setSelectValidity(select, true);
      });
    });

    const mcForm = document.getElementById('mc-contact-form');
    const mcSubmitBtn = document.getElementById('mc-submit-btn');
    const mcFormError = document.getElementById('mc-form-error');
    // const newsletterConsent = document.getElementById('mc-acepta-newsletter');

    mcForm.addEventListener('submit', function(e){
      e.preventDefault();
      mcFormError.classList.remove('mc-active');

      const provinciaOk = setSelectValidity(provinciaSelect, !!provinciaSelect.value);
      const tipoOk = setSelectValidity(tipoSelect, !!tipoSelect.value);

      if(!provinciaOk || !tipoOk){
        const firstInvalid = !provinciaOk ? provinciaSelect : tipoSelect;
        const trigger = firstInvalid.closest('.mc-select-wrap').querySelector('.mc-select-trigger');
        if(trigger) trigger.focus();
        return;
      }

      if(!mcForm.checkValidity()){
        mcForm.reportValidity();
        return;
      }

      const branchKey = tipoSelect.value;
      const config = MC_BRANCH_CONFIG[branchKey];
      if(!config){
        mcFormError.textContent = 'Tipo de consulta no reconocido.';
        mcFormError.classList.add('mc-active');
        return;
      }

      const fieldValues = {
        nombre: document.getElementById('mc-nombre').value.trim(),
        provincia: provinciaSelect.value,
        ciudad: document.getElementById('mc-ciudad').value.trim(),
        email: document.getElementById('mc-email').value.trim(),
        telefono: document.getElementById('mc-telefono').value.trim(),
        comentarios: document.getElementById('mc-comentarios').value.trim(),
        nombre_comercio: (document.getElementById('mc-comercio') || {}).value || '',
        tipo_producto: (document.getElementById('mc-tipo-producto') || {}).value || '',
        area_interes: (document.getElementById('mc-area') || {}).value || '',
        archivo: ''
      };

      const file = uploadInput.files[0] || null;

      mcSubmitBtn.disabled = true;
      mcSubmitBtn.textContent = 'Enviando…';

      Promise.resolve()
        .then(function(){
          return file ? fileToBase64(file) : '';
        })
        .then(function(base64File){
          fieldValues.archivo = base64File || '';

          const data = config.buildData(fieldValues);
          data.origen = config.origen;
          // data.acepta_newsletter = newsletterConsent.checked;

          const body = {
            payload: {
              submittedAt: new Date().toISOString(),
              data: data
            }
          };

          return fetch(MC_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        })
        .then(function(response){
          if(!response.ok) throw new Error('HTTP ' + response.status);
          mcForm.reset();
          resetUploadZone(uploadZone);
          updateConditionals(tipoSelect.value);
          alert('¡Gracias! Tu consulta fue enviada correctamente.');
        })
        .catch(function(err){
          console.error('Error enviando formulario:', err);
          mcFormError.classList.add('mc-active');
        })
        .finally(function(){
          mcSubmitBtn.disabled = false;
          mcSubmitBtn.textContent = 'Enviar';
        });
    });
  })();
