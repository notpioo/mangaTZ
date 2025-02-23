const express = require('express');
const axios = require('axios');
const router = express.Router();

// Search endpoint
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q?.toLowerCase() || '';
        const response = await axios.get(`https://api.mangadex.org/manga`, {
            params: {
                title: query,
                limit: 5,
                includes: ['cover_art'],
                order: {
                    relevance: 'desc'
                }
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search manga' });
    }
});

// Popular manga route
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[followedCount]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive'],
                'hasAvailableChapters': true,
                'availableTranslatedLanguage[]': ['en']
            }
        });

        // Get statistics for all manga
        const mangaIds = response.data.data.map(manga => manga.id);
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga?manga[]=${mangaIds.join('&manga[]=')}`);
        
        // Add rating to each manga
        response.data.data = response.data.data.map(manga => {
            const stats = statsResponse.data.statistics[manga.id];
            manga.attributes.rating = {
                average: stats?.rating?.average ? Number(stats.rating.average.toFixed(2)) : 0,
                count: stats?.rating?.count || 0
            };
            return manga;
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular manga:', error);
        res.status(500).json({ error: 'Failed to fetch popular manga', details: error.message });
    }
});

// Top rated manga route
router.get('/top-rated', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[rating]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive'],
                'hasAvailableChapters': true,
                'status[]': ['completed', 'ongoing'],
                'availableTranslatedLanguage[]': ['en']
            }
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid API response');
        }

        // Get statistics for all manga
        const mangaIds = response.data.data.map(manga => manga.id);
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga?manga[]=${mangaIds.join('&manga[]=')}`);

        // Add rating to each manga
        response.data.data = response.data.data.map(manga => {
            const stats = statsResponse.data.statistics[manga.id];
            manga.attributes.rating = {
                average: stats?.rating?.average ? Number(stats.rating.average.toFixed(2)) : 0,
                count: stats?.rating?.count || 0
            };
            return manga;
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching top rated manga:', error);
        res.status(500).json({ error: 'Failed to fetch top rated manga', details: error.message });
    }
});


// Staff picks manga route
router.get('/staff-picks', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive'],
                'hasAvailableChapters': true,
                'limit': 12,
                'publicationDemographic[]': ['seinen', 'shounen'],
                'order[followedCount]': 'desc',
                'status[]': ['ongoing'],
                'year': 2023,
                'availableTranslatedLanguage[]': ['en']
            }
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid API response');
        }

        // Get statistics for all manga
        const mangaIds = response.data.data.map(manga => manga.id);
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga?manga[]=${mangaIds.join('&manga[]=')}`);

        // Add rating to each manga
        response.data.data = response.data.data.map(manga => {
            const stats = statsResponse.data.statistics[manga.id];
            manga.attributes.rating = {
                average: stats?.rating?.average ? Number(stats.rating.average.toFixed(2)) : 0,
                count: stats?.rating?.count || 0
            };
            return manga;
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching staff picks manga:', error);
        res.status(500).json({ error: 'Failed to fetch staff picks manga', details: error.message });
    }
});

// Recently added manga route
router.get('/recently-added', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[createdAt]': 'desc',
                'includes[]': ['cover_art', 'author'],
                'contentRating[]': ['safe', 'suggestive'],
                'hasAvailableChapters': true,
                'limit': 12
            }
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid API response');
        }

        // Get statistics for all manga
        const mangaIds = response.data.data.map(manga => manga.id);
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga?manga[]=${mangaIds.join('&manga[]=')}`);

        // Add rating to each manga
        response.data.data = response.data.data.map(manga => {
            const stats = statsResponse.data.statistics[manga.id];
            manga.attributes.rating = {
                average: stats?.rating?.average ? Number(stats.rating.average.toFixed(2)) : 0,
                count: stats?.rating?.count || 0
            };
            return manga;
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recently added manga:', error);
        res.status(500).json({ error: 'Failed to fetch recently added manga', details: error.message });
    }
});

// Latest manga route
router.get('/latest', async (req, res) => {
    try {
        const response = await axios.get('https://api.mangadex.org/manga', {
            params: {
                'order[latestUploadedChapter]': 'desc',
                'limit': 12,
                'includes[]': ['cover_art', 'author', 'artist'],
                'contentRating[]': ['safe', 'suggestive'],
                'hasAvailableChapters': true
            }
        });

        // Get statistics for all manga
        const mangaIds = response.data.data.map(manga => manga.id);
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga?manga[]=${mangaIds.join('&manga[]=')}`);

        // Add statistics to each manga
        response.data.data = response.data.data.map(manga => {
            const stats = statsResponse.data.statistics[manga.id];
            manga.attributes.rating = {
                average: stats?.rating?.average ? Number(stats.rating.average.toFixed(2)) : 0,
                count: stats?.rating?.count || 0
            };
            return manga;
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching latest manga:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch latest manga' });
    }
});

// Cover proxy route
router.get('/cover/:mangaId/:fileName', async (req, res) => {
    try {
        const { mangaId, fileName } = req.params;
        const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;

        const response = await axios.get(coverUrl, {
            responseType: 'stream',
            timeout: 5000 // Tambahkan timeout
        });

        // Set cache headers
        res.set('Cache-Control', 'public, max-age=86400'); // Cache selama 24 jam
        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching cover:', error.message);
        // Redirect ke no-image jika gagal
        res.redirect('/images/no-image.png');
    }
});

// Get chapter data
router.get('/chapter/:id', async (req, res) => {
    try {
        const chapterId = req.params.id;
        const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
        
        const chapterResponse = await axios.get(`https://api.mangadex.org/chapter/${chapterId}`);
        
        // Format data for client
        const baseUrl = response.data.baseUrl;
        const chapter = chapterResponse.data.data;
        const hash = response.data.chapter.hash;
        const data = response.data.chapter.data.map(filename => ({
            url: `${baseUrl}/data/${hash}/${filename}`
        }));

        res.json({
            chapter: {
                data,
                attributes: chapter.attributes
            }
        });
    } catch (error) {
        console.error('Error fetching chapter:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const mangaId = req.params.id;
        const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}`, {
            params: {
                'includes[]': ['cover_art', 'author', 'artist', 'tag']
            }
        });

        // Get chapters for this manga
        const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
            params: {
                'translatedLanguage[]': ['en'],
                'order[chapter]': 'desc',
                'limit': 500,
                'offset': 0
            }
        });

        // Get manga statistics
        const statsResponse = await axios.get(`https://api.mangadex.org/statistics/manga/${mangaId}`);
        const stats = statsResponse.data;

        // Add rating to manga data
        if (stats.statistics && stats.statistics[mangaId]) {
            response.data.data.attributes.rating = {
                average: stats.statistics[mangaId].rating.average ? Number(stats.statistics[mangaId].rating.average.toFixed(2)) : 0
            };
        }

        const responseData = {
            manga: response.data,
            chapters: chaptersResponse.data
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching manga details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch manga details' });
    }
});

module.exports = router;
// Get chapter images
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        
        // Get chapter data
        const chapterResponse = await axios.get(`https://api.mangadex.org/chapter/${chapterId}`);
        
        // Get chapter pages
        const pagesResponse = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
        
        const baseUrl = pagesResponse.data.baseUrl;
        const chapter = pagesResponse.data.chapter;
        
        // Construct image URLs
        const imageUrls = chapter.data.map(filename => 
            `${baseUrl}/data/${chapter.hash}/${filename}`
        );
        
        res.json({
            chapter: chapterResponse.data,
            images: imageUrls
        });
    } catch (error) {
        console.error('Error fetching chapter:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});
