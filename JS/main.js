        let allVerses = [];
        let currentPage = 1;
        const versesPerPage = 15;
        let selectedVerseText = '';
        let selectedVerseNumber = 0;
        let selectedSurahNumber = 0;
        let selectedSurahName = '';
        let currentBookmarks = JSON.parse(localStorage.getItem('quranBookmarks')) || [];
        
        window.onload = function() {
            fetchSurahs();
            checkSystemTheme();
            loadSettings();
        };
        
        function loadSettings() {
            const savedFontSize = localStorage.getItem('fontSize');
            const savedLineHeight = localStorage.getItem('lineHeight');
            const savedThemeMode = localStorage.getItem('themeMode');
            
            if (savedFontSize) {
                document.getElementById('fontSize').value = savedFontSize;
                document.querySelectorAll('.verse').forEach(v => {
                    v.style.fontSize = savedFontSize;
                });
            }
            
            if (savedLineHeight) {
                document.getElementById('lineHeight').value = savedLineHeight;
                document.querySelectorAll('.verse').forEach(v => {
                    v.style.lineHeight = savedLineHeight;
                });
            }
            
            if (savedThemeMode) {
                document.getElementById('themeMode').value = savedThemeMode;
                if (savedThemeMode === 'dark' || (savedThemeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.body.classList.add('dark-mode');
                    document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
                }
            }
        }
        
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const themeIcon = document.getElementById('themeIcon');
            themeIcon.classList.toggle('fa-moon');
            themeIcon.classList.toggle('fa-sun');
            
            const themeMode = document.getElementById('themeMode').value;
            if (themeMode !== 'auto') {
                localStorage.setItem('themeMode', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            }
        }
        
        function checkSystemTheme() {
            const themeMode = localStorage.getItem('themeMode');
            if (themeMode === 'auto' || !themeMode) {
                const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                if (darkModeMediaQuery.matches) {
                    document.body.classList.add('dark-mode');
                    document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
                }
                
                darkModeMediaQuery.addListener(e => {
                    if (themeMode === 'auto') {
                        if (e.matches) {
                            document.body.classList.add('dark-mode');
                            document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
                        } else {
                            document.body.classList.remove('dark-mode');
                            document.getElementById('themeIcon').classList.replace('fa-sun', 'fa-moon');
                        }
                    }
                });
            }
        }
        
        function changeFontSize() {
            const fontSize = document.getElementById('fontSize').value;
            document.querySelectorAll('.verse').forEach(v => {
                v.style.fontSize = fontSize;
            });
            localStorage.setItem('fontSize', fontSize);
        }
        
        function changeLineHeight() {
            const lineHeight = document.getElementById('lineHeight').value;
            document.querySelectorAll('.verse').forEach(v => {
                v.style.lineHeight = lineHeight;
            });
            localStorage.setItem('lineHeight', lineHeight);
        }
        
        function changeThemeMode() {
            const themeMode = document.getElementById('themeMode').value;
            localStorage.setItem('themeMode', themeMode);
            
            if (themeMode === 'auto') {
                checkSystemTheme();
            } else if (themeMode === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
            } else {
                document.body.classList.remove('dark-mode');
                document.getElementById('themeIcon').classList.replace('fa-sun', 'fa-moon');
            }
        }
        
        async function fetchSurahs() {
            showLoading();
            try {
                const response = await fetch('https://api.alquran.cloud/v1/quran/ar');
                const data = await response.json();
                const surahs = data.data.surahs;
                const surahList = document.getElementById('surahList');
                surahList.innerHTML = '';
                
                for (let i = 0; i < surahs.length; i += 4) {
                    const row = document.createElement('div');
                    row.className = 'row';
                    
                    for (let j = 0; j < 4 && i + j < surahs.length; j++) {
                        const surah = surahs[i + j];
                        row.innerHTML += `
                            <div class="col-md-3 col-sm-6">
                                <button class="btn surah-btn w-100" onclick="fetchVerses(${surah.number}, '${surah.name}')">
                                    ${surah.name} (${surah.englishName})
                                </button>
                            </div>
                        `;
                    }
                    
                    surahList.appendChild(row);
                }
                
                surahList.style.display = 'block';
                hideLoading();
            } catch (error) {
                console.error('خطأ في جلب السور:', error);
                hideLoading();
                alert('حدث خطأ أثناء جلب السور. يرجى المحاولة لاحقًا.');
            }
        }
        
        async function fetchVerses(surahNumber, surahName) {
            showLoading();
            try {
                const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar`);
                const data = await response.json();
                allVerses = data.data.ayahs;
                selectedSurahNumber = surahNumber;
                selectedSurahName = surahName;
                currentPage = 1;
                displayPage();
                document.getElementById('surahList').style.display = 'none';
                document.getElementById('versesContainer').style.display = 'block';
                hideLoading();
                
                checkBookmark();
            } catch (error) {
                console.error('خطأ في جلب الآيات:', error);
                hideLoading();
                alert('حدث خطأ أثناء جلب الآيات. يرجى المحاولة لاحقًا.');
            }
        }
        
        function displayPage() {
            const versesList = document.getElementById('versesList');
            const surahTitle = document.getElementById('surahTitle');
            surahTitle.textContent = ` ${selectedSurahName}`;
            const start = (currentPage - 1) * versesPerPage;
            const end = start + versesPerPage;
            const pageVerses = allVerses.slice(start, end);
            versesList.innerHTML = '';
            
            pageVerses.forEach(verse => {
                versesList.innerHTML += `
                    <div class="verse" data-text="${verse.text}" data-number="${verse.numberInSurah}" data-surah="${selectedSurahNumber}" onclick="handleVerseClick(this)">
                        <span class="verse-text">${verse.text}</span>
                        <span class="verse-number">${verse.numberInSurah}</span>
                    </div>
                `;
            });
            
            const fontSize = document.getElementById('fontSize').value;
            const lineHeight = document.getElementById('lineHeight').value;
            document.querySelectorAll('.verse').forEach(v => {
                v.style.fontSize = fontSize;
                v.style.lineHeight = lineHeight;
            });
            
            updatePaginationButtons();
            window.scrollTo(0, document.getElementById('versesContainer').offsetTop);
        }
        
        function updatePaginationButtons() {
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage * versesPerPage >= allVerses.length;
        }
        
        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                displayPage();
            }
        }
        
        function nextPage() {
            if (currentPage * versesPerPage < allVerses.length) {
                currentPage++;
                displayPage();
            }
        }
        
        function handleVerseClick(verseElement) {
            selectedVerseText = verseElement.dataset.text;
            selectedVerseNumber = parseInt(verseElement.dataset.number);
            selectedSurahNumber = parseInt(verseElement.dataset.surah);
        }
        
        document.addEventListener('contextmenu', function(e) {
            if (e.target.closest('.verse')) {
                e.preventDefault();
                const verse = e.target.closest('.verse');
                handleVerseClick(verse);
                const contextMenu = document.getElementById('contextMenu');
                contextMenu.style.display = 'block';
                contextMenu.style.top = `${e.pageY}px`;
                contextMenu.style.left = `${e.pageX}px`;
            } else {
                document.getElementById('contextMenu').style.display = 'none';
            }
        });
        
        document.addEventListener('click', function() {
            document.getElementById('contextMenu').style.display = 'none';
        });
        
        function copySelectedVerse() {
            navigator.clipboard.writeText(selectedVerseText);
            showToast('تم نسخ الآية بنجاح');
        }
        
        async function fetchTranslationForSelected() {
            showLoading();
            try {
                const response = await fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurahNumber}:${selectedVerseNumber}/en.sahih`);
                const data = await response.json();
                const translationModal = new bootstrap.Modal(document.getElementById('translationModal'));
                const translationContent = document.getElementById('translationContent');
                
                translationContent.innerHTML = `
                    <h5 class="text-center mb-4"> ${selectedSurahName} - الآية ${selectedVerseNumber}</h5>
                    <div class="verse-arabic text-end mb-4" style="font-size: 1.8rem; font-family: 'Amiri Quran', serif;">
                        ${selectedVerseText}
                    </div>
                    <div class="translation-text" style="font-size: 1.2rem; line-height: 1.8;">
                        <strong>الترجمة:</strong><br>
                        ${data.data.text}
                    </div>
                `;
                
                translationModal.show();
                hideLoading();
            } catch (error) {
                console.error('خطأ في جلب الترجمة:', error);
                hideLoading();
                showToast('فشل في جلب الترجمة');
            }
        }
        
        async function fetchTafsirForSelected() {
            const tafsirModal = new bootstrap.Modal(document.getElementById('tafsirModal'));
            const tafsirContent = document.getElementById('tafsirContent');
            tafsirContent.innerHTML = 'جارٍ تحميل التفسير...';
            tafsirModal.show();
            showLoading();
            
            try {
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': 'AIzaSyC8M-gdYoAo_0OLnNx4kmdqlYZVZ2yybJw'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `فسّر هذه الآية القرآنية: "${selectedVerseText}" من سورة ${selectedSurahName}، واذكر:
- أسباب نزولها إن وجدت.
- التفسير من المصادر المشهورة مثل ابن كثير والطبري.
- العبرة من الآية.
- الدروس المستفادة.
- الأحكام الفقهية المتعلقة بها إن وجدت.
- السياق التاريخي للآية.
- تفسير الكلمات الصعبة.`
                            }]
                        }]
                    })
                });
                
                const data = await response.json();
                const tafsirText = data.candidates[0].content.parts[0].text || 'لا يوجد تفسير متاح';
                
                tafsirContent.innerHTML = `
                    <h5 class="text-center mb-4">تفسير الآية ${selectedVerseNumber} من سورة ${selectedSurahName}</h5>
                    <div class="verse-arabic text-end mb-4" style="font-size: 1.8rem; font-family: 'Amiri Quran', serif;">
                        ${selectedVerseText}
                    </div>
                    <div class="tafsir-text" style="font-size: 1.1rem; line-height: 1.8;">
                        ${tafsirText.replace(/\n/g, '<br>')}
                    </div>
                `;
                
                hideLoading();
            } catch (error) {
                console.error('خطأ في جلب التفسير:', error);
                tafsirContent.innerHTML = 'فشل في جلب التفسير. تأكد من مفتاح API أو الاتصال بالإنترنت.';
                hideLoading();
            }
        }
        
        function searchSurahs() {
            const input = document.getElementById('searchInput').value.toLowerCase();
            const surahButtons = document.querySelectorAll('.surah-btn');
            
            surahButtons.forEach(button => {
                const parent = button.parentElement;
                if (button.textContent.toLowerCase().includes(input)) {
                    parent.style.display = 'block';
                } else {
                    parent.style.display = 'none';
                }
            });
        }
        
        function toggleBookmark() {
            const bookmarkBtn = document.getElementById('bookmarkBtn');
            const existingIndex = currentBookmarks.findIndex(b => 
                b.surahNumber === selectedSurahNumber && b.verseNumber === selectedVerseNumber
            );
            
            if (existingIndex >= 0) {
                currentBookmarks.splice(existingIndex, 1);
                bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i>';
                showToast('تمت إزالة العلامة المرجعية');
            } else {
                currentBookmarks.push({
                    surahNumber: selectedSurahNumber,
                    surahName: selectedSurahName,
                    verseNumber: selectedVerseNumber,
                    verseText: selectedVerseText,
                    date: new Date().toLocaleDateString()
                });
                bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                showToast('تمت إضافة العلامة المرجعية');
            }
            
            localStorage.setItem('quranBookmarks', JSON.stringify(currentBookmarks));
        }
        
        function checkBookmark() {
            const bookmarkBtn = document.getElementById('bookmarkBtn');
            const exists = currentBookmarks.some(b => 
                b.surahNumber === selectedSurahNumber && b.verseNumber === selectedVerseNumber
            );
            
            bookmarkBtn.innerHTML = exists ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
        }
        
        function showBookmarksList() {
            const bookmarksContainer = document.getElementById('bookmarksContainer');
            bookmarksContainer.innerHTML = '';
            
            if (currentBookmarks.length === 0) {
                bookmarksContainer.innerHTML = '<p class="text-center">لا توجد علامات مرجعية</p>';
            } else {
                currentBookmarks.forEach((bookmark, index) => {
                    const item = document.createElement('div');
                    item.className = 'bookmark-item';
                    item.innerHTML = `
                        <div>
                            <strong>${bookmark.surahName}</strong> - الآية ${bookmark.verseNumber}
                            <div style="font-size: 0.9rem; color: #666;">${bookmark.date}</div>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-primary" onclick="goToBookmark(${index})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="remove-bookmark" onclick="removeBookmark(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    bookmarksContainer.appendChild(item);
                });
            }
            
            document.getElementById('bookmarksList').style.display = 'block';
        }
        
        function closeBookmarksList() {
            document.getElementById('bookmarksList').style.display = 'none';
        }
        
        function goToBookmark(index) {
            const bookmark = currentBookmarks[index];
            fetchVerses(bookmark.surahNumber, bookmark.surahName).then(() => {
                setTimeout(() => {
                    selectedVerseNumber = bookmark.verseNumber;
                    const verseElement = document.querySelector(`.verse[data-number="${selectedVerseNumber}"]`);
                    if (verseElement) {
                        handleVerseClick(verseElement);
                        verseElement.scrollIntoView({behavior: 'smooth', block: 'center'});
                        verseElement.classList.add('verse-highlight');
                        setTimeout(() => {
                            verseElement.classList.remove('verse-highlight');
                        }, 3000);
                    }
                }, 500);
            });
            closeBookmarksList();
        }
        
        function removeBookmark(index) {
            currentBookmarks.splice(index, 1);
            localStorage.setItem('quranBookmarks', JSON.stringify(currentBookmarks));
            showBookmarksList();
            showToast('تمت إزالة العلامة المرجعية');
        }
        
        function showSettings() {
            document.getElementById('settingsPanel').style.display = 'block';
        }
        
        function closeSettings() {
            document.getElementById('settingsPanel').style.display = 'none';
        }
        
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-3 p-3 bg-success text-white rounded';
            toast.style.zIndex = '1100';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
        
        function showLoading() {
            document.getElementById('loadingSpinner').style.display = 'flex';
        }
        
        function hideLoading() {
            document.getElementById('loadingSpinner').style.display = 'none';
        }