// Results Gallery - Flat layout with lazy loading and synced hover playback
// Data structure for all categories

const resultsData = {
  Diversity: {
    items: {
      "1.1": [0,1,2,3,4,5],
      "2.1": [0,1,2,3,4],
      "2.2": [0,1,2,3,4,5],
      "2.3": [0,1,2,3,4,5,6],
      "2.4": [0,1,2,3,4,5],
      "2.5": [0,1,2,3,4],
      "2.6": [0,1,2,3,4],
      "3.1": [0,1,2,3,4],
      "3.2": [0,1,2,3,4,5],
      "3.3": [0,1,2,3,4,5],
      "3.4": [0,1,2,3,4],
      "3.5": [0,1,2,3,4],
      "3.6": [0,1,2,3,4,5]
    }
  },
  Geometric: {
    items: {
      "1.1": [0,1,2,3,4,5],
      "1.2": [0,1,2,3,4],
      "2.1": [0,1,2,3,4],
      "3.1": [0,1,2,3,4,5],
      "3.2": [0,1,2,3,4,5],
      "3.3": [0,1,2,3,4],
      "4.1": [0,1,2,3,4,5,6]
    }
  },
  Spatial: {
    items: {
      "1.1": [0,1,2,3,4],
      "1.2": [0,1,2,3],
      "2.1": [0,1,2,3,4,5],
      "2.2": [0,1,2,3,4],
      "3.1": [0,1,2,3,4,5,6]
    }
  },
  Texture: {
    items: {
      "1.1": [0,1,2,3,4,5],
      "1.2": [0,1,2,3,4,5],
      "1.3": [0,1,2,3,4],
      "2.1": [0,1,2,3,4,5],
      "3.1": [0,1,2,3,4,5,6]
    }
  }
};

let pendingJumpTargetId = null;

function setupJumpNavigation() {
  const jumpButtons = document.querySelectorAll('.vr-jump-btn');
  if (!jumpButtons.length) return;

  jumpButtons.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      const href = btn.getAttribute('href') || '';
      const targetId = href.startsWith('#') ? href.slice(1) : '';
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      pendingJumpTargetId = targetId;
    });
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────

function getImageDimensions(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = src;
  });
}

function sortedSubclassKeys(items) {
  return Object.keys(items).sort((a, b) => {
    const [am, an] = a.split('.').map(Number);
    const [bm, bn] = b.split('.').map(Number);
    return am - bm || an - bn;
  });
}

// ── Pre-measure all images in parallel ───────────────────────────────────

async function preloadAllDimensions() {
  const dims = {};
  const promises = [];

  for (const [category, data] of Object.entries(resultsData)) {
    for (const [sc, nums] of Object.entries(data.items)) {
      for (const num of nums) {
        const path = `static/results/${category}/${sc}/${num}/imageSeg.png`;
        promises.push(
          getImageDimensions(path).then(d => { dims[path] = d; })
        );
      }
    }
  }

  await Promise.all(promises);
  return dims;
}

// ── Build DOM ────────────────────────────────────────────────────────────

function buildCategorySection(category, data, dims) {
  const section = document.createElement('div');
  section.className = 'vr-category';
  section.id = `vr-${category.toLowerCase()}`;

  // Category title
  const title = document.createElement('h3');
  title.className = 'vr-category-title';
  title.textContent = category;
  section.appendChild(title);

  // Column header row
  const header = document.createElement('div');
  header.className = 'vr-row vr-header-row';
  header.innerHTML =
    '<div class="vr-cell">Input Image</div>' +
    '<div class="vr-cell">Azimuth View</div>' +
    '<div class="vr-cell">Elevation View</div>';
  section.appendChild(header);

  // Collect & sort subclasses
  const subclasses = sortedSubclassKeys(data.items);
  let rowIdx = 0;

  for (const sc of subclasses) {
    const nums = data.items[sc];

    // Measure and sort by H/W ascending within each subclass
    const measured = nums.map(num => {
      const path = `static/results/${category}/${sc}/${num}/imageSeg.png`;
      const d = dims[path] || { width: 1, height: 1 };
      return { num, ratio: d.height / d.width, width: d.width, height: d.height };
    });
    measured.sort((a, b) => a.ratio - b.ratio);

    for (const item of measured) {
      const row = document.createElement('div');
      row.className = 'vr-row' + (rowIdx % 2 === 1 ? ' vr-row-alt' : '');

      const base = `static/results/${category}/${sc}/${item.num}`;

      row.innerHTML =
        '<div class="vr-cell">' +
          '<img data-src="' + base + '/imageSeg.png" alt="' + category + ' ' + sc + '-' + item.num + '" width="' + item.width + '" height="' + item.height + '">' +
        '</div>' +
        '<div class="vr-cell">' +
          '<video muted loop playsinline preload="none" data-src="' + base + '/output.mp4" style="aspect-ratio:' + item.width + ' / ' + item.height + ';"></video>' +
        '</div>' +
        '<div class="vr-cell">' +
          '<video muted loop playsinline preload="none" data-src="' + base + '/output_u.mp4" style="aspect-ratio:' + item.width + ' / ' + item.height + ';"></video>' +
        '</div>';

      section.appendChild(row);
      rowIdx++;
    }
  }

  return section;
}

// ── Intersection Observer: lazy-load images + videos ─────────────────────

function setupIntersectionObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const row = entry.target;

      if (entry.isIntersecting) {
        // Lazy-load the image if not yet loaded
        const img = row.querySelector('img[data-src]');
        if (img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }

        // Load and auto-play videos
        row.querySelectorAll('video').forEach(v => {
          if (!v.hasAttribute('src') && v.dataset.src) {
            v.src = v.dataset.src;
          }
          v.play().catch(() => {});
        });
      } else {
        // Pause and release video resources
        row.querySelectorAll('video').forEach(v => {
          v.pause();
          if (v.hasAttribute('src')) {
            v.removeAttribute('src');
            v.load();
          }
        });
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.05
  });

  document.querySelectorAll('.vr-row:not(.vr-header-row)').forEach(row => {
    observer.observe(row);
  });
}

// ── Hover: sync-restart both videos from t=0 ────────────────────────────

function setupHoverSync() {
  document.querySelectorAll('.vr-row:not(.vr-header-row)').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const videos = row.querySelectorAll('video');
      videos.forEach(v => {
        // Ensure source is loaded
        if (!v.hasAttribute('src') && v.dataset.src) {
          v.src = v.dataset.src;
        }
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    });
  });
}

// ── Init ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('results-gallery');
  if (!container) return;

  setupJumpNavigation();

  // Show loading state
  container.innerHTML = '<p class="vr-loading">Loading visual results…</p>';

  // Pre-measure all image dimensions in parallel
  const dims = await preloadAllDimensions();

  // Build all category sections
  const fragment = document.createDocumentFragment();
  const categories = ['Geometric', 'Texture', 'Spatial', 'Diversity'];

  for (const cat of categories) {
    fragment.appendChild(buildCategorySection(cat, resultsData[cat], dims));
  }

  container.innerHTML = '';
  container.appendChild(fragment);

  if (pendingJumpTargetId) {
    const pendingTarget = document.getElementById(pendingJumpTargetId);
    if (pendingTarget) {
      pendingTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    pendingJumpTargetId = null;
  }

  // Wire up lazy loading + hover sync
  setupIntersectionObserver();
  setupHoverSync();
});
