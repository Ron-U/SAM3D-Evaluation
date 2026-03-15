// Results Gallery Data and Rendering
// Data structure for all categories

const resultsData = {
  Diversity: {
    groups: {
      "1": ["1.1"],
      "2": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
      "3": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"]
    },
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
    groups: {
      "1": ["1.1", "1.2"],
      "2": ["2.1"],
      "3": ["3.1", "3.2", "3.3"],
      "4": ["4.1"]
    },
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
    groups: {
      "1": ["1.1", "1.2"],
      "2": ["2.1", "2.2"],
      "3": ["3.1"]
    },
    items: {
      "1.1": [0,1,2,3,4],
      "1.2": [0,1,2,3],
      "2.1": [0,1,2,3,4,5],
      "2.2": [0,1,2,3,4],
      "3.1": [0,1,2,3,4,5,6]
    }
  },
  Texture: {
    groups: {
      "1": ["1.1", "1.2", "1.3"],
      "2": ["2.1"],
      "3": ["3.1"]
    },
    items: {
      "1.1": [0,1,2,3,4,5],
      "1.2": [0,1,2,3,4,5],
      "1.3": [0,1,2,3,4],
      "2.1": [0,1,2,3,4,5],
      "3.1": [0,1,2,3,4,5,6]
    }
  }
};

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initResultsGallery();
});

function initResultsGallery() {
  const container = document.getElementById('results-gallery');
  if (!container) return;

  const categories = ['Geometric', 'Texture', 'Spatial', 'Diversity'];
  
  categories.forEach(category => {
    const card = createCategoryCard(category, resultsData[category]);
    container.appendChild(card);
  });
}

function createCategoryCard(category, data) {
  const card = document.createElement('div');
  card.className = 'category-card';
  card.id = `card-${category}`;

  // Header
  const header = document.createElement('div');
  header.className = 'category-header';
  header.textContent = category;
  card.appendChild(header);

  // Group tabs
  const groupTabs = document.createElement('div');
  groupTabs.className = 'group-tabs';
  
  const groupKeys = Object.keys(data.groups);
  groupKeys.forEach((groupNum, idx) => {
    const tab = document.createElement('button');
    tab.className = 'group-tab' + (idx === 0 ? ' active' : '');
    tab.textContent = `Group ${groupNum}`;
    tab.dataset.group = groupNum;
    tab.onclick = () => switchGroup(category, groupNum);
    groupTabs.appendChild(tab);
  });
  card.appendChild(groupTabs);

  // Content container
  const content = document.createElement('div');
  content.className = 'category-content';

  groupKeys.forEach((groupNum, idx) => {
    const groupContent = createGroupContent(category, groupNum, data.groups[groupNum], data.items, idx === 0);
    content.appendChild(groupContent);
  });

  card.appendChild(content);

  // Scroll navigation
  const scrollNav = document.createElement('div');
  scrollNav.className = 'scroll-nav';
  scrollNav.innerHTML = `
    <button class="scroll-btn" onclick="scrollContent('${category}', -200)" title="Scroll Up">
      <i class="fas fa-chevron-up"></i>
    </button>
    <button class="scroll-btn" onclick="scrollContent('${category}', 200)" title="Scroll Down">
      <i class="fas fa-chevron-down"></i>
    </button>
  `;
  card.appendChild(scrollNav);

  return card;
}

function createGroupContent(category, groupNum, subclasses, items, isActive) {
  const groupContent = document.createElement('div');
  groupContent.className = 'group-content' + (isActive ? ' active' : '');
  groupContent.id = `${category}-group-${groupNum}`;

  // Subclass tabs (only if more than one subclass)
  if (subclasses.length > 1) {
    const subclassTabs = document.createElement('div');
    subclassTabs.className = 'subclass-tabs';
    
    subclasses.forEach((subclass, idx) => {
      const tab = document.createElement('button');
      tab.className = 'subclass-tab' + (idx === 0 ? ' active' : '');
      tab.textContent = subclass;
      tab.dataset.subclass = subclass;
      tab.onclick = () => switchSubclass(category, groupNum, subclass);
      subclassTabs.appendChild(tab);
    });
    groupContent.appendChild(subclassTabs);
  }

  // Column headers
  const headers = document.createElement('div');
  headers.className = 'column-headers';
  headers.innerHTML = `
    <div class="column-header">Input Image</div>
    <div class="column-header">3D Output</div>
  `;
  groupContent.appendChild(headers);

  // Subclass contents
  subclasses.forEach((subclass, idx) => {
    const subContent = document.createElement('div');
    subContent.className = 'subclass-content' + (idx === 0 ? ' active' : '');
    subContent.id = `${category}-${groupNum}-${subclass}`;

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'scroll-container';
    scrollContainer.id = `scroll-${category}-${groupNum}-${subclass}`;

    const itemNumbers = items[subclass] || [];
    itemNumbers.forEach(itemNum => {
      const row = createResultRow(category, subclass, itemNum);
      scrollContainer.appendChild(row);
    });

    subContent.appendChild(scrollContainer);
    groupContent.appendChild(subContent);
  });

  return groupContent;
}

function createResultRow(category, subclass, itemNum) {
  const row = document.createElement('div');
  row.className = 'result-row';

  const basePath = `static/results/${category}/${subclass}/${itemNum}`;

  row.innerHTML = `
    <div class="result-image">
      <img src="${basePath}/imageSeg.png" alt="${category} ${subclass} #${itemNum} Input" loading="lazy">
    </div>
    <div class="result-video">
      <video controls muted loop playsinline>
        <source src="${basePath}/output.mp4" type="video/mp4">
        Your browser does not support video.
      </video>
    </div>
  `;

  return row;
}

function switchGroup(category, groupNum) {
  const card = document.getElementById(`card-${category}`);
  if (!card) return;

  // Update tabs
  card.querySelectorAll('.group-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.group === groupNum);
  });

  // Update content
  card.querySelectorAll('.group-content').forEach(content => {
    content.classList.toggle('active', content.id === `${category}-group-${groupNum}`);
  });
}

function switchSubclass(category, groupNum, subclass) {
  const groupContent = document.getElementById(`${category}-group-${groupNum}`);
  if (!groupContent) return;

  // Update tabs
  groupContent.querySelectorAll('.subclass-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.subclass === subclass);
  });

  // Update content
  groupContent.querySelectorAll('.subclass-content').forEach(content => {
    content.classList.toggle('active', content.id === `${category}-${groupNum}-${subclass}`);
  });
}

function scrollContent(category, delta) {
  const card = document.getElementById(`card-${category}`);
  if (!card) return;

  const activeGroup = card.querySelector('.group-content.active');
  if (!activeGroup) return;

  const activeSubclass = activeGroup.querySelector('.subclass-content.active');
  if (!activeSubclass) return;

  const scrollContainer = activeSubclass.querySelector('.scroll-container');
  if (scrollContainer) {
    scrollContainer.scrollBy({
      top: delta,
      behavior: 'smooth'
    });
  }
}

// Auto-play videos on hover
document.addEventListener('mouseover', function(e) {
  if (e.target.tagName === 'VIDEO') {
    e.target.play();
  }
});

document.addEventListener('mouseout', function(e) {
  if (e.target.tagName === 'VIDEO') {
    e.target.pause();
    e.target.currentTime = 0;
  }
});
