/**
 * ============================================================
 * TAG ASSISTANT - Post Safety Toolkit for Jcink Forums
 * Version: 1.0.0
 * 
 * A semi-automated trigger warning system that helps users
 * identify and add content warnings to their posts.
 * 
 * Installation:
 * const PST_CONFIG = { ... };
 * <script src="tag-assistant.js"></script>
 * ============================================================
 */

(function() {
    'use strict';

    // ============================================================
    // 1. CONFIGURATION
    // ============================================================

    /**
     * Default configuration. Can be overridden by defining
     * window.PST_CONFIG before loading this script.
     */
    var DEFAULTS = {
        // Enable/disable the tag assistant
        tagAssistant: true,
        
        // Quick tags shown on posting page (category IDs)
        quickTags: [
            'abuse-violence',
            'mental-health',
            'death-gore',
            'sexual-abuse',
            'eating-disorder',
            'substance-abuse',
            'hate-speech',
            'war-terrorism'
        ],
        
        // Custom keywords to add to existing categories
        customKeywords: {},
        
        // Custom categories (new tag types)
        customCategories: {},
        
        // Set to true to use ONLY custom keywords/categories
        replaceKeywords: false,
        
        // Minimum confidence level to show suggestions
        // 'high', 'medium', or 'low'
        minConfidence: 'medium',
        
        // Enable learning system
        learningEnabled: true
    };

    // Merge user config with defaults
    var config = {};
    for (var key in DEFAULTS) {
        if (DEFAULTS.hasOwnProperty(key)) {
            config[key] = DEFAULTS[key];
        }
    }
    if (typeof window.PST_CONFIG !== 'undefined') {
        for (var key in window.PST_CONFIG) {
            if (window.PST_CONFIG.hasOwnProperty(key)) {
                config[key] = window.PST_CONFIG[key];
            }
        }
    }

    // ============================================================
    // 2. KEYWORD DATABASE
    // ============================================================

    /**
     * Default keyword categories with high-confidence phrases
     * and medium-confidence word+context patterns.
     */
    var DEFAULT_KEYWORDS = {

        // ---- ABUSE/VIOLENCE ----
        'abuse-violence': {
            label: 'Abuse/Violence',
            color: '#DC143C',
            high: [
                'physical abuse', 'physically abused', 'physical assault',
                'domestic abuse', 'domestic violence',
                'violent attack', 'brutally attacked',
                'gun violence', 'stab wound', 'stabbed repeatedly',
                'gang violence', 'mob violence',
                'beaten badly', 'badly beaten',
                'brutal assault', 'vicious assault',
                'emotional abuse', 'emotionally abused',
                'psychological abuse', 'mentally abused',
                'verbal abuse', 'verbally abused',
                'harassment', 'harassed', 'harassing',
                'bullying', 'bullied', 'bully',
                'abused me', 'assaulted me', 'beat me',
                'hit me', 'hurt me', 'violence against me',
                'punched me', 'kicked me',
                'abused her', 'abused him', 'abused them',
                'assaulted her', 'assaulted him', 'assaulted them',
                'beat her', 'beat him', 'beat them',
                'hit her', 'hit him', 'hit them',
                'violence against her', 'violence against him',
                'violence against them',
                'punched her', 'punched him', 'kicked her', 'kicked him'
            ],
            medium: {
                words: ['abuse', 'assault', 'violence', 'harass', 'bully', 'beat', 'hit', 'punch', 'kick'],
                contexts: [
                    ['physical', 'verbal', 'emotional', 'psychological', 'domestic'],
                    ['her', 'him', 'them', 'me'],
                    ['attack', 'hurt', 'pain', 'injury', 'blood']
                ]
            }
        },

        // ---- MENTAL HEALTH ----
        'mental-health': {
            label: 'Mental Health',
            color: '#8B0000',
            high: [
                'cut my wrist', 'cut his wrist', 'cut her wrist', 'cut their wrist',
                'cut myself', 'cut himself', 'cut herself', 'cut themselves',
                'slice my wrist', 'slice his wrist', 'slice her wrist',
                'self harm', 'self-harm', 'self injury', 'self-injury',
                'harm myself', 'harm himself', 'harm herself',
                'injure myself', 'injure himself', 'injure herself',
                'wrist cutting', 'arm cutting', 'cutting behavior',
                'razor blade', 'razor blades',
                'self mutilation', 'self-mutilation',
                'scars on my wrist', 'scars on his wrist', 'scars on her wrist',
                'suicide attempt', 'attempted suicide',
                'kill myself', 'kill himself', 'kill herself', 'kill themselves',
                'killed myself', 'killed himself', 'killed herself',
                'want to die', 'wanted to die', 'wants to die',
                'suicidal thoughts', 'suicidal ideation',
                'death wish', 'had a death wish',
                'commit suicide', 'committed suicide',
                'take my own life', 'take his own life', 'take her own life',
                'took my own life', 'took his own life', 'took her own life',
                'suicide note', 'suicide pact',
                'hanging myself', 'hanging himself', 'hanging herself',
                'overdose suicide',
                'severe depression', 'clinical depression',
                'anxiety attack', 'panic attack', 'severe anxiety',
                'ptsd', 'post traumatic stress', 'post-traumatic stress',
                'trauma response', 'traumatic experience',
                'mental breakdown', 'nervous breakdown',
                'emotional breakdown',
                'i cut myself', 'i self-harmed',
                'i want to die', 'i want to kill myself',
                'i am suicidal', 'i feel suicidal',
                'my depression', 'my anxiety', 'my ptsd',
                'they cut themselves', 'he self-harmed', 'she self-harmed',
                'their depression', 'her anxiety', 'his ptsd',
                'he is suicidal', 'she is suicidal', 'they are suicidal'
            ],
            medium: {
                words: ['cut', 'slice', 'suicide', 'depress', 'anxiety', 'trauma', 'ptsd'],
                contexts: [
                    ['wrist', 'arm', 'self', 'myself', 'yourself', 'himself', 'herself'],
                    ['thought', 'feeling', 'struggle', 'battle'],
                    ['want to die', 'want to kill', 'suicidal']
                ]
            }
        },

        // ---- DEATH/GORE ----
        'death-gore': {
            label: 'Death/Gore',
            color: '#FF4500',
            high: [
                'blood spatter', 'blood splatter', 'blood bath',
                'dismemberment', 'dismembered body', 'dismembered corpse',
                'decapitation', 'decapitated', 'decapitated body',
                'guts spilled', 'entrails', 'internal organs',
                'gore fest', 'splatter horror',
                'blood-soaked', 'covered in blood',
                'gore everywhere', 'gore covered',
                'torn apart', 'ripped apart', 'ripped to pieces',
                'blown to pieces', 'blasted apart',
                'limbs severed', 'severed limbs',
                'body parts', 'body part',
                'pool of blood', 'puddle of blood',
                'blood dripping', 'blood pouring',
                'bloody murder', 'grisly scene', 'gruesome scene',
                'torture porn', 'extreme gore',
                'violent death', 'brutal death', 'painful death',
                'died violently', 'died brutally',
                'murdered violently', 'brutally murdered',
                'mass murder', 'massacre',
                'killing spree', 'murder spree',
                'i died', 'i was killed', 'i was murdered',
                'i was torn apart', 'i was ripped apart',
                'he died violently', 'she died violently',
                'he was killed', 'she was killed',
                'he was murdered', 'she was murdered',
                'their body was torn apart'
            ],
            medium: {
                words: ['blood', 'gore', 'guts', 'corpse', 'body', 'limb', 'death', 'die', 'kill', 'murder'],
                contexts: [
                    ['dead', 'death', 'murder', 'kill', 'slaughter'],
                    ['spill', 'spatter', 'splatter', 'puddle', 'pool'],
                    ['torn', 'ripped', 'severed', 'cut', 'slice']
                ]
            }
        },

        // ---- SEXUAL ABUSE ----
        'sexual-abuse': {
            label: 'Sexual Abuse',
            color: '#800080',
            high: [
                'sexual assault', 'sexually assaulted',
                'raped', 'raping', 'rape',
                'date rape', 'acquaintance rape',
                'sexual abuse', 'sexually abused',
                'molested', 'molestation',
                'sexual harassment', 'sexually harassed',
                'forced sex', 'forced sexual contact',
                'sexual violence', 'sexually violent',
                'non-consensual sex', 'nonconsensual sex',
                'sexual coercion', 'coerced sex',
                'sexual exploitation', 'exploited sexually',
                'pedophilia', 'pedophile', 'child sexual abuse',
                'raped me', 'assaulted me sexually',
                'molested me', 'abused me sexually',
                'took advantage of me sexually',
                'forced me to have sex',
                'raped her', 'raped him', 'raped them',
                'assaulted her sexually', 'assaulted him sexually',
                'molested her', 'molested him',
                'abused her sexually', 'abused him sexually',
                'forced himself on her', 'forced herself on him',
                'took advantage of her', 'took advantage of him'
            ],
            medium: {
                words: ['assault', 'abuse', 'force', 'non-consensual', 'rape', 'molest'],
                contexts: [
                    ['sexual', 'sex', 'intimate', 'sexually'],
                    ['rape', 'raping', 'raped'],
                    ['him', 'her', 'them', 'me']
                ]
            }
        },

        // ---- EATING DISORDER ----
        'eating-disorder': {
            label: 'Eating Disorder',
            color: '#800000',
            high: [
                'eating disorder', 'eating disorders',
                'anorexia', 'anorexia nervosa',
                'bulimia', 'bulimia nervosa',
                'binge eating', 'binge eating disorder',
                'compulsive eating', 'overeating',
                'purging', 'purging behavior',
                'starvation', 'starving myself',
                'food restriction', 'restricting food',
                'body dysmorphia', 'body image disorder',
                'forced vomiting', 'making myself vomit',
                'laxative abuse', 'over-exercising',
                'extreme dieting', 'crash dieting',
                'weight loss obsession', 'obsessed with weight',
                'fear of gaining weight', 'terrified of weight gain',
                'i have an eating disorder',
                'i am anorexic', 'i am bulimic',
                'i starve myself', 'i purge',
                'my eating disorder',
                'she has an eating disorder',
                'he has an eating disorder',
                'they have an eating disorder',
                'she is anorexic', 'he is bulimic'
            ],
            medium: {
                words: ['anorexia', 'bulimia', 'purge', 'starve', 'binging', 'eating disorder'],
                contexts: [
                    ['food', 'weight', 'body', 'image'],
                    ['control', 'obsess', 'fear'],
                    ['vomit', 'laxative', 'exercise']
                ]
            }
        },

        // ---- SUBSTANCE ABUSE ----
        'substance-abuse': {
            label: 'Substance Abuse',
            color: '#B22222',
            high: [
                'drug addiction', 'drug addict', 'addicted to drugs',
                'substance abuse', 'substance use disorder',
                'overdose', 'overdosed', 'drug overdose',
                'drug withdrawal', 'withdrawing from drugs',
                'cocaine', 'heroin', 'meth', 'crack',
                'prescription drug abuse',
                'pill addiction', 'painkiller addiction',
                'alcohol addiction', 'alcoholic', 'alcoholism',
                'alcohol abuse', 'problem drinking',
                'binge drinking', 'heavy drinking',
                'drunk', 'blackout drunk',
                'alcohol poisoning', 'alcohol overdose',
                'withdrawal', 'withdrawal symptoms',
                'i am an addict', 'i am addicted',
                'i am an alcoholic',
                'my addiction', 'my substance abuse',
                'i overdosed', 'i blacked out',
                'he is an addict', 'she is an addict',
                'he is an alcoholic', 'she is an alcoholic',
                'their addiction', 'their substance abuse'
            ],
            medium: {
                words: ['addiction', 'overdose', 'withdrawal', 'drug', 'alcohol', 'drunk'],
                contexts: [
                    ['abuse', 'dependent', 'addict'],
                    ['prescription', 'illegal', 'substance'],
                    ['cocaine', 'heroin', 'meth', 'crack', 'pills']
                ]
            }
        },

        // ---- HATE SPEECH ----
        'hate-speech': {
            label: 'Hate Speech',
            color: '#A52A2A',
            high: [
                'racial slur', 'racist slur', 'racial abuse',
                'racism', 'racist', 'racial discrimination',
                'hate crime', 'racial violence',
                'sexism', 'sexist', 'gender discrimination',
                'misogyny', 'misogynist', 'misogynistic',
                'misandry', 'misandrist',
                'homophobia', 'homophobic', 'homophobe',
                'transphobia', 'transphobic', 'transphobe',
                'queerphobia', 'anti-lgbtq',
                'hate speech', 'hateful language',
                'discrimination', 'discriminatory language',
                'bigotry', 'bigoted', 'bigot',
                'xenophobia', 'xenophobic',
                'i experienced racism', 'i experienced sexism',
                'i was discriminated against',
                'he experienced racism', 'she experienced sexism',
                'they were discriminated against'
            ],
            medium: {
                words: ['racist', 'sexist', 'homophobic', 'transphobic', 'bigot', 'hate', 'discrimination'],
                contexts: [
                    ['speech', 'language', 'comment', 'slur'],
                    ['abuse', 'violence', 'attack'],
                    ['against', 'towards']
                ]
            }
        },

        // ---- WAR/TERRORISM ----
        'war-terrorism': {
            label: 'War/Terrorism',
            color: '#B22222',
            high: [
                'war zone', 'war crimes', 'war crime',
                'armed conflict', 'military conflict',
                'civil war', 'urban warfare',
                'battlefield', 'combat zone',
                'bombing', 'bombings', 'air strike',
                'artillery shelling', 'shelling',
                'massacre', 'massacred',
                'genocide', 'ethnic cleansing',
                'prisoner of war', 'torture in war',
                'war trauma', 'combat trauma',
                'terrorist attack', 'terrorism',
                'bomb blast', 'suicide bomber',
                'hostage situation', 'hostage taking',
                'terrorist threat', 'terrorist plot',
                'radicalization', 'extremism',
                'i was in a war', 'i survived war',
                'i witnessed a terrorist attack',
                'he was in combat', 'she experienced war',
                'they survived a terrorist attack'
            ],
            medium: {
                words: ['war', 'terrorism', 'terrorist', 'bomb', 'massacre', 'genocide', 'conflict'],
                contexts: [
                    ['attack', 'violence', 'killing', 'death'],
                    ['military', 'armed', 'combat', 'battle'],
                    ['civilian', 'innocent', 'victim']
                ]
            }
        }
    };

    // Merge custom keywords and categories
    function buildKeywordDatabase() {
        var db = {};
        for (var key in DEFAULT_KEYWORDS) {
            if (DEFAULT_KEYWORDS.hasOwnProperty(key)) {
                db[key] = {
                    label: DEFAULT_KEYWORDS[key].label,
                    color: DEFAULT_KEYWORDS[key].color,
                    high: DEFAULT_KEYWORDS[key].high.slice(),
                    medium: {
                        words: DEFAULT_KEYWORDS[key].medium.words.slice(),
                        contexts: DEFAULT_KEYWORDS[key].medium.contexts.slice()
                    }
                };
            }
        }

        if (config.replaceKeywords) {
            db = {};
        }

        // Add custom categories
        if (config.customCategories) {
            for (var id in config.customCategories) {
                if (config.customCategories.hasOwnProperty(id)) {
                    var cat = config.customCategories[id];
                    if (!db[id]) {
                        db[id] = {
                            label: cat.label || id,
                            color: cat.color || '#666666',
                            high: cat.keywords || [],
                            medium: cat.medium || { words: [], contexts: [] }
                        };
                    }
                }
            }
        }

        // Add custom keywords to existing categories
        if (config.customKeywords) {
            for (var id in config.customKeywords) {
                if (config.customKeywords.hasOwnProperty(id)) {
                    var keywords = config.customKeywords[id];
                    if (db[id]) {
                        if (Array.isArray(keywords)) {
                            db[id].high = db[id].high.concat(keywords);
                        } else if (keywords.high) {
                            db[id].high = db[id].high.concat(keywords.high);
                        }
                        if (keywords.medium) {
                            db[id].medium = keywords.medium;
                        }
                    }
                }
            }
        }

        return db;
    }

    var KEYWORDS = buildKeywordDatabase();

    // ============================================================
    // 3. HELPER FUNCTIONS
    // ============================================================

    function isPostingPage() {
        return window.location.href.indexOf('act=Post') !== -1;
    }

    function isNewThread() {
        return window.location.href.indexOf('CODE=00') !== -1;
    }

    function isEditPage() {
        return window.location.href.indexOf('CODE=04') !== -1;
    }

    function stripQuotes(content) {
        if (!content) return '';
        content = content.replace(/\[quote\](.*?)\[\/quote\]/gs, '');
        content = content.replace(/\[quote=.*?\](.*?)\[\/quote\]/gs, '');
        content = content.replace(/<blockquote>(.*?)<\/blockquote>/gs, '');
        content = content.replace(/<blockquote class=.*?>(.*?)<\/blockquote>/gs, '');
        return content;
    }

    function stripTagsDiv(content) {
        if (!content) return '';
        return content.replace(/<div[^>]*class="tw-tags"[^>]*>.*?<\/div>[\s]*/gs, '');
    }

    function extractTagsDiv(content) {
        var match = content.match(/<div[^>]*class="tw-tags"[^>]*>.*?<\/div>/s);
        return match ? match[0] : null;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getElement(id) {
        var el = document.getElementById(id);
        if (!el) {
            console.warn('[Tag Assistant] Element not found: #' + id);
            return null;
        }
        return el;
    }

    // ============================================================
    // 4. LEARNING SYSTEM
    // ============================================================

    var LearningSystem = {
        getKey: function() {
            return 'tw_learning_data';
        },

        load: function() {
            try {
                var data = localStorage.getItem(this.getKey());
                return data ? JSON.parse(data) : { decisions: [], blocked: [] };
            } catch (e) {
                return { decisions: [], blocked: [] };
            }
        },

        save: function(data) {
            try {
                localStorage.setItem(this.getKey(), JSON.stringify(data));
            } catch (e) {
                // Quiet fail
            }
        },

        recordDecision: function(keyword, context, tagId, accepted) {
            if (!config.learningEnabled) return;
            var data = this.load();
            data.decisions.push({
                keyword: keyword.toLowerCase(),
                context: context || '',
                tag: tagId,
                accepted: accepted,
                timestamp: Date.now()
            });
            if (data.decisions.length > 1000) {
                data.decisions = data.decisions.slice(-1000);
            }
            this.save(data);
        },

        blockSuggestion: function(keyword, context, tagId) {
            if (!config.learningEnabled) return;
            var data = this.load();
            var key = keyword.toLowerCase() + '|' + (context || '') + '|' + tagId;
            if (data.blocked.indexOf(key) === -1) {
                data.blocked.push(key);
                this.save(data);
            }
        },

        isBlocked: function(keyword, context, tagId) {
            if (!config.learningEnabled) return false;
            var data = this.load();
            var key = keyword.toLowerCase() + '|' + (context || '') + '|' + tagId;
            return data.blocked.indexOf(key) !== -1;
        },

        getConfidenceBoost: function(keyword, context, tagId) {
            if (!config.learningEnabled) return 0;
            var data = this.load();
            var matches = [];
            for (var i = 0; i < data.decisions.length; i++) {
                var d = data.decisions[i];
                if (d.keyword === keyword.toLowerCase() && d.tag === tagId && d.accepted === true) {
                    matches.push(d);
                }
            }
            if (matches.length >= 3) return 30;
            if (matches.length >= 2) return 15;
            if (matches.length >= 1) return 5;
            return 0;
        }
    };

    // ============================================================
    // 5. SCANNER ENGINE
    // ============================================================

    function scanContent(content) {
        var results = [];
        var cleanContent = stripQuotes(content);
        if (!cleanContent.trim()) return results;

        var foundCategories = {};

        for (var catId in KEYWORDS) {
            if (!KEYWORDS.hasOwnProperty(catId)) continue;
            var cat = KEYWORDS[catId];
            var confidence = 0;
            var matches = [];
            var context = '';

            // Check high-confidence phrases
            if (cat.high && Array.isArray(cat.high)) {
                for (var i = 0; i < cat.high.length; i++) {
                    var phrase = cat.high[i];
                    if (cleanContent.toLowerCase().indexOf(phrase.toLowerCase()) !== -1) {
                        confidence = Math.max(confidence, 80);
                        matches.push(phrase);
                        var idx = cleanContent.toLowerCase().indexOf(phrase.toLowerCase());
                        var start = Math.max(0, idx - 50);
                        var end = Math.min(cleanContent.length, idx + phrase.length + 50);
                        context = cleanContent.substring(start, end);
                    }
                }
            }

            // Check medium-confidence patterns
            if (cat.medium && cat.medium.words && cat.medium.contexts) {
                var words = cat.medium.words;
                var contexts = cat.medium.contexts;
                
                for (var j = 0; j < words.length; j++) {
                    var word = words[j];
                    var wordLower = word.toLowerCase();
                    if (cleanContent.toLowerCase().indexOf(wordLower) !== -1) {
                        var contextFound = false;
                        var contextWords = [];
                        var wordIndex = cleanContent.toLowerCase().indexOf(wordLower);
                        var windowStart = Math.max(0, wordIndex - 50);
                        var windowEnd = Math.min(cleanContent.length, wordIndex + word.length + 50);
                        var windowText = cleanContent.substring(windowStart, windowEnd).toLowerCase();
                        
                        for (var k = 0; k < contexts.length; k++) {
                            var contextList = contexts[k];
                            for (var l = 0; l < contextList.length; l++) {
                                var contextWord = contextList[l];
                                if (windowText.indexOf(contextWord.toLowerCase()) !== -1) {
                                    contextFound = true;
                                    contextWords.push(contextWord);
                                }
                            }
                        }

                        if (contextFound) {
                            var baseConfidence = 40;
                            var boost = LearningSystem.getConfidenceBoost(word, windowText, catId);
                            var wordConfidence = Math.min(100, baseConfidence + boost);
                            if (wordConfidence > confidence) {
                                confidence = wordConfidence;
                                matches.push(word);
                                context = 'Context: "' + contextWords.join(', ') + '" found near "' + word + '"';
                            }
                        }
                    }
                }
            }

            if (matches.length > 0 && confidence > 0) {
                if (LearningSystem.isBlocked(matches[0], context, catId)) {
                    confidence = 0;
                }
            }

            var minConfidence = getMinConfidenceValue();
            if (confidence >= minConfidence && !foundCategories[catId]) {
                var level = 'low';
                if (confidence >= 70) level = 'high';
                else if (confidence >= 50) level = 'medium';

                results.push({
                    category: catId,
                    label: cat.label,
                    color: cat.color,
                    confidence: confidence,
                    level: level,
                    matches: matches.slice(0, 5),
                    context: context || matches[0] || ''
                });

                foundCategories[catId] = true;
            }
        }

        results.sort(function(a, b) {
            return b.confidence - a.confidence;
        });

        return results;
    }

    function getMinConfidenceValue() {
        switch (config.minConfidence) {
            case 'high': return 70;
            case 'medium': return 45;
            case 'low': return 20;
            default: return 45;
        }
    }

    // ============================================================
    // 6. UI INJECTION
    // ============================================================

    function injectUI() {
        var form = getElement('REPLIER');
        if (!form) return;

        var postAsRow = document.getElementById('post-as');
        if (!postAsRow) {
            console.warn('[Tag Assistant] Could not find #post-as row');
            return;
        }

        var headerRow = document.createElement('tr');
        headerRow.id = 'tw-header';
        headerRow.innerHTML = '<td colspan="2" class="pformstrip">Trigger Tags</td>';

        var quickTagsRow = document.createElement('tr');
        quickTagsRow.id = 'tw-quick-tags-row';
        
        var quickTagsHtml = '';
        for (var i = 0; i < config.quickTags.length; i++) {
            var catId = config.quickTags[i];
            if (KEYWORDS[catId]) {
                var cat = KEYWORDS[catId];
                quickTagsHtml += '<button class="tw-quick-tag" data-category="' + catId + '" ' +
                    'style="background: ' + cat.color + '; color: white;" ' +
                    'title="Add ' + cat.label + ' tag">' +
                    '+ Add ' + cat.label +
                    '</button>';
            }
        }

        quickTagsRow.innerHTML = 
            '<td class="pformleft">Quick Tags</td>' +
            '<td width="100%" class="pformright" style="padding: 8px 0;">' +
                '<div class="tw-quick-tags-container">' + quickTagsHtml + '</div>' +
                '<div style="font-size: 11px; color: #666; margin-top: 4px;">' +
                    'Click to add or remove tags from your post' +
                '</div>' +
            '</td>';

        var scanRow = document.createElement('tr');
        scanRow.id = 'tw-scan-row';
        scanRow.innerHTML = 
            '<td class="pformleft">Scan for Tags</td>' +
            '<td width="100%" class="pformright" style="padding: 8px 0;">' +
                '<button id="tw-scan-btn" class="tw-scan-btn">🔍 Check for Tags</button>' +
                '<span id="tw-scan-status" style="margin-left: 12px; font-size: 13px;"></span>' +
                '<div style="font-size: 11px; color: #666; margin-top: 4px;">' +
                    'Scan your post for potential trigger warnings' +
                '</div>' +
            '</td>';

        postAsRow.parentNode.insertBefore(headerRow, postAsRow.nextSibling);
        postAsRow.parentNode.insertBefore(quickTagsRow, headerRow.nextSibling);
        postAsRow.parentNode.insertBefore(scanRow, quickTagsRow.nextSibling);

        var quickTagBtns = document.querySelectorAll('.tw-quick-tag');
        for (var j = 0; j < quickTagBtns.length; j++) {
            quickTagBtns[j].addEventListener('click', handleQuickTag);
        }

        var scanBtn = document.getElementById('tw-scan-btn');
        if (scanBtn) {
            scanBtn.addEventListener('click', handleScan);
        }

        if (!sessionStorage.getItem('tw_confirmed_tags')) {
            sessionStorage.setItem('tw_confirmed_tags', JSON.stringify([]));
        }

        form.addEventListener('submit', handleSubmit);
    }

    // ============================================================
    // 7. UI HANDLERS
    // ============================================================

    function handleQuickTag(e) {
        var btn = e.currentTarget;
        var category = btn.dataset.category;
        var tags = JSON.parse(sessionStorage.getItem('tw_confirmed_tags') || '[]');
        var cat = KEYWORDS[category];
        var label = cat ? cat.label : category;

        if (tags.indexOf(category) === -1) {
            tags.push(category);
            btn.classList.add('active');
            btn.style.opacity = '0.85';
            btn.textContent = '✕ Remove ' + label;
            btn.title = 'Click to remove ' + label + ' tag';
            updateStatus('➕ Added "' + label + '" tag');
        } else {
            var index = tags.indexOf(category);
            if (index > -1) tags.splice(index, 1);
            btn.classList.remove('active');
            btn.style.opacity = '1';
            btn.textContent = '+ Add ' + label;
            btn.title = 'Click to add ' + label + ' tag';
            updateStatus('➖ Removed "' + label + '" tag');
        }

        sessionStorage.setItem('tw_confirmed_tags', JSON.stringify(tags));
        
        var count = tags.length;
        if (count > 0) {
            var labels = [];
            for (var i = 0; i < tags.length; i++) {
                var catObj = KEYWORDS[tags[i]];
                labels.push(catObj ? catObj.label : tags[i]);
            }
            updateStatus('✅ ' + count + ' tag(s) confirmed: ' + labels.join(', '));
        } else {
            updateStatus('No tags confirmed yet');
        }
    }

    function handleScan() {
        var textarea = document.querySelector('textarea[name="Post"]');
        if (!textarea) {
            showModal('Error', 'Could not find post content. Please refresh and try again.', 'error');
            return;
        }

        var content = textarea.value;
        if (!content.trim()) {
            showModal('Info', 'Your post is empty. Write something first, then scan for tags.', 'info');
            return;
        }

        updateStatus('🔍 Scanning for trigger content...');
        var cleanContent = stripTagsDiv(content);
        var results = scanContent(cleanContent);

        if (results.length === 0) {
            updateStatus('✅ No triggers found in your post');
            showModal('No Triggers Found', 'Your post doesn\'t appear to contain any trigger content based on our scan.\n\nYou can still manually add tags using the Quick Tags buttons if needed.', 'info');
            return;
        }

        showSuggestionsModal(results);
    }

    function showSuggestionsModal(results) {
        var suggestionsHtml = '';
        var filteredResults = [];
        var lowResults = [];

        for (var i = 0; i < results.length; i++) {
            if (results[i].level === 'high' || results[i].level === 'medium') {
                filteredResults.push(results[i]);
            } else {
                lowResults.push(results[i]);
            }
        }

        for (var j = 0; j < filteredResults.length; j++) {
            suggestionsHtml += buildSuggestionItem(filteredResults[j]);
        }

        var lowHtml = '';
        if (lowResults.length > 0) {
            var lowItemsHtml = '';
            for (var k = 0; k < lowResults.length; k++) {
                lowItemsHtml += buildSuggestionItem(lowResults[k]);
            }
            lowHtml = 
                '<div id="tw-low-suggestions" style="display: none;">' +
                    lowItemsHtml +
                '</div>' +
                '<button id="tw-show-more-btn" class="tw-modal-btn tw-show-more">' +
                    'Show ' + lowResults.length + ' more suggestion(s) (low confidence)' +
                '</button>';
        }

        var modalHtml = 
            '<div id="tw-modal-overlay" class="tw-modal-overlay">' +
                '<div id="tw-modal" class="tw-modal">' +
                    '<div class="tw-modal-header">' +
                        '<h2>⚠️ Trigger Tag Suggestions</h2>' +
                        '<button id="tw-modal-close" class="tw-modal-close">&times;</button>' +
                    '</div>' +
                    '<div class="tw-modal-body">' +
                        '<p class="tw-modal-subtitle">' +
                            'Found potential triggers in your post. Accept or reject each suggestion.' +
                        '</p>' +
                        '<div id="tw-suggestions-list">' +
                            suggestionsHtml +
                            lowHtml +
                        '</div>' +
                    '</div>' +
                    '<div class="tw-modal-footer">' +
                        '<div class="tw-modal-actions">' +
                            '<button id="tw-confirm-all" class="tw-modal-btn tw-confirm-all">✓ Confirm All</button>' +
                            '<button id="tw-reject-all" class="tw-modal-btn tw-reject-all">✗ Reject All</button>' +
                            '<button id="tw-done-btn" class="tw-modal-btn tw-done-btn">Done</button>' +
                        '</div>' +
                        '<div id="tw-modal-status" class="tw-modal-status"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        setupModalEvents();

        setTimeout(function() {
            var overlay = document.getElementById('tw-modal-overlay');
            if (overlay) overlay.style.opacity = '1';
        }, 10);
    }

    function buildSuggestionItem(result) {
        var checked = result.level === 'high' ? 'checked' : '';
        var confidenceBar = getConfidenceBar(result.confidence);
        var matchesText = '';
        var matchLimit = Math.min(3, result.matches.length);
        for (var i = 0; i < matchLimit; i++) {
            if (i > 0) matchesText += ', ';
            matchesText += '"' + escapeHtml(result.matches[i]) + '"';
        }

        var contextHtml = result.context ? 
            '<span class="tw-suggestion-context">' + escapeHtml(result.context) + '</span>' : '';

        return (
            '<div class="tw-suggestion-item tw-suggestion-' + result.level + '" data-category="' + result.category + '">' +
                '<div class="tw-suggestion-check">' +
                    '<input type="checkbox" class="tw-suggestion-checkbox" ' + checked + ' ' +
                        'data-category="' + result.category + '">' +
                '</div>' +
                '<div class="tw-suggestion-info">' +
                    '<div class="tw-suggestion-label" style="color: ' + result.color + ';">' +
                        escapeHtml(result.label) +
                    '</div>' +
                    '<div class="tw-suggestion-confidence">' +
                        '<span class="tw-confidence-bar">' + confidenceBar + '</span>' +
                        '<span class="tw-confidence-text">' + result.confidence + '%</span>' +
                    '</div>' +
                    '<div class="tw-suggestion-matches">' +
                        'Found: ' + matchesText +
                        contextHtml +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function getConfidenceBar(confidence) {
        var width = Math.min(100, confidence);
        var color = '#ff4444';
        if (confidence >= 70) color = '#44bb44';
        else if (confidence >= 50) color = '#ffaa44';
        
        return '<span class="tw-confidence-track">' +
                    '<span class="tw-confidence-fill" style="width: ' + width + '%; background: ' + color + ';"></span>' +
                '</span>';
    }

    function setupModalEvents() {
        var closeBtn = document.getElementById('tw-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        var overlay = document.getElementById('tw-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        }

        var confirmAll = document.getElementById('tw-confirm-all');
        if (confirmAll) {
            confirmAll.addEventListener('click', function() {
                var checkboxes = document.querySelectorAll('.tw-suggestion-checkbox');
                for (var i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = true;
                }
                updateModalStatus();
            });
        }

        var rejectAll = document.getElementById('tw-reject-all');
        if (rejectAll) {
            rejectAll.addEventListener('click', function() {
                var checkboxes = document.querySelectorAll('.tw-suggestion-checkbox');
                for (var i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = false;
                }
                updateModalStatus();
            });
        }

        var showMore = document.getElementById('tw-show-more-btn');
        if (showMore) {
            showMore.addEventListener('click', function() {
                var lowSection = document.getElementById('tw-low-suggestions');
                if (lowSection) {
                    lowSection.style.display = 'block';
                    this.style.display = 'none';
                }
            });
        }

        var doneBtn = document.getElementById('tw-done-btn');
        if (doneBtn) {
            doneBtn.addEventListener('click', function() {
                confirmSuggestions();
            });
        }

        var checkboxes = document.querySelectorAll('.tw-suggestion-checkbox');
        for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].addEventListener('change', updateModalStatus);
        }

        updateModalStatus();
    }

    function updateModalStatus() {
        var total = document.querySelectorAll('.tw-suggestion-checkbox').length;
        var checked = document.querySelectorAll('.tw-suggestion-checkbox:checked').length;
        var statusEl = document.getElementById('tw-modal-status');
        if (statusEl) {
            statusEl.textContent = checked + ' of ' + total + ' suggestions confirmed';
            statusEl.style.color = checked > 0 ? '#2ecc71' : '#888';
        }
    }

    function closeModal() {
        var overlay = document.getElementById('tw-modal-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(function() {
                overlay.remove();
            }, 300);
        }
    }

    function confirmSuggestions() {
        var checked = document.querySelectorAll('.tw-suggestion-checkbox:checked');
        var confirmedTags = [];

        for (var i = 0; i < checked.length; i++) {
            var category = checked[i].dataset.category;
            confirmedTags.push(category);
        }

        var existingTags = JSON.parse(sessionStorage.getItem('tw_confirmed_tags') || '[]');
        var allTags = existingTags.slice();
        for (var j = 0; j < confirmedTags.length; j++) {
            if (allTags.indexOf(confirmedTags[j]) === -1) {
                allTags.push(confirmedTags[j]);
            }
        }
        sessionStorage.setItem('tw_confirmed_tags', JSON.stringify(allTags));

        if (config.learningEnabled) {
            var suggestionItems = document.querySelectorAll('.tw-suggestion-item');
            for (var k = 0; k < suggestionItems.length; k++) {
                var item = suggestionItems[k];
                var category = item.dataset.category;
                var cb = item.querySelector('.tw-suggestion-checkbox');
                var matchesEl = item.querySelector('.tw-suggestion-matches');
                var matchesText = matchesEl ? matchesEl.textContent : '';
                var keywordMatch = matchesText.match(/"([^"]+)"/);
                var keyword = keywordMatch ? keywordMatch[1] : '';
                var contextEl = item.querySelector('.tw-suggestion-context');
                var context = contextEl ? contextEl.textContent : '';
                
                if (cb) {
                    LearningSystem.recordDecision(keyword, context, category, cb.checked);
                    if (!cb.checked) {
                        LearningSystem.blockSuggestion(keyword, context, category);
                    }
                }
            }
        }

        var quickTagBtns = document.querySelectorAll('.tw-quick-tag');
        for (var l = 0; l < quickTagBtns.length; l++) {
            var btn = quickTagBtns[l];
            var category = btn.dataset.category;
            var cat = KEYWORDS[category];
            var label = cat ? cat.label : category;
            
            if (allTags.indexOf(category) !== -1) {
                btn.classList.add('active');
                btn.style.opacity = '0.85';
                btn.textContent = '✕ Remove ' + label;
                btn.title = 'Click to remove ' + label + ' tag';
            } else {
                btn.classList.remove('active');
                btn.style.opacity = '1';
                btn.textContent = '+ Add ' + label;
                btn.title = 'Click to add ' + label + ' tag';
            }
        }

        if (allTags.length > 0) {
            var labels = [];
            for (var m = 0; m < allTags.length; m++) {
                var catObj = KEYWORDS[allTags[m]];
                labels.push(catObj ? catObj.label : allTags[m]);
            }
            updateStatus('✅ ' + allTags.length + ' tag(s) confirmed: ' + labels.join(', '));
        } else {
            updateStatus('No tags confirmed');
        }

        closeModal();
    }

    function updateStatus(message) {
        var statusEl = document.getElementById('tw-scan-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = '#2c3e50';
        }
    }

    // ============================================================
    // 8. MODAL DISPLAY
    // ============================================================

    function showModal(title, message, type) {
        type = type || 'info';
        var icon = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '⚠️';
        var color = type === 'error' ? '#e74c3c' : type === 'info' ? '#3498db' : '#f39c12';

        var modalHtml = 
            '<div id="tw-modal-overlay" class="tw-modal-overlay">' +
                '<div id="tw-modal" class="tw-modal tw-modal-simple">' +
                    '<div class="tw-modal-header" style="border-bottom-color: ' + color + ';">' +
                        '<h2>' + icon + ' ' + escapeHtml(title) + '</h2>' +
                        '<button id="tw-modal-close" class="tw-modal-close">&times;</button>' +
                    '</div>' +
                    '<div class="tw-modal-body">' +
                        '<p style="font-size: 15px; line-height: 1.6; white-space: pre-wrap;">' + escapeHtml(message) + '</p>' +
                    '</div>' +
                    '<div class="tw-modal-footer">' +
                        '<button id="tw-modal-ok" class="tw-modal-btn tw-modal-ok" ' +
                            'style="background: ' + color + '; color: white;">OK</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        var overlay = document.getElementById('tw-modal-overlay');
        setTimeout(function() {
            if (overlay) overlay.style.opacity = '1';
        }, 10);

        var closeBtn = document.getElementById('tw-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        var okBtn = document.getElementById('tw-modal-ok');
        if (okBtn) okBtn.addEventListener('click', closeModal);

        overlay.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    // ============================================================
    // 9. SUBMIT HANDLER
    // ============================================================

    function handleSubmit(e) {
        var textarea = document.querySelector('textarea[name="Post"]');
        if (!textarea) return;

        var confirmedTags = JSON.parse(sessionStorage.getItem('tw_confirmed_tags') || '[]');
        var content = textarea.value;
        var hasTags = confirmedTags.length > 0;

        if (!hasTags && content.trim()) {
            var cleanContent = stripTagsDiv(content);
            var results = scanContent(cleanContent);
            
            if (results.length > 0) {
                var shouldContinue = confirm(
                    '⚠️ Your post may contain trigger content that hasn\'t been tagged.\n\n' +
                    'Would you like to continue anyway without adding trigger warnings?'
                );
                
                if (!shouldContinue) {
                    e.preventDefault();
                    handleScan();
                    return;
                }
            }
        }

        if (hasTags && content.trim()) {
            var finalContent = content;
            finalContent = stripTagsDiv(finalContent);
            var tagsHtml = buildTagsDiv(confirmedTags);
            finalContent = tagsHtml + '\n\n' + finalContent;
            textarea.value = finalContent;

            if (isNewThread()) {
                var titleInput = document.querySelector('input[name="TopicTitle"]');
                if (titleInput && titleInput.value.indexOf('[TW] ') === -1) {
                    titleInput.value = '[TW] ' + titleInput.value;
                }
            }

            sessionStorage.removeItem('tw_confirmed_tags');
        }
    }

    function buildTagsDiv(tags) {
        if (!tags || tags.length === 0) return '';

        var tagSpans = '';
        for (var i = 0; i < tags.length; i++) {
            var id = tags[i];
            var cat = KEYWORDS[id];
            if (!cat) continue;
            if (tagSpans.length > 0) tagSpans += ' ';
            tagSpans += '<span class="tw-tag tw-tag-' + id + '" style="background: ' + cat.color + ';">' + 
                escapeHtml(cat.label) + 
                '</span>';
        }

        if (!tagSpans) return '';

        return '<div class="tw-tags">⚠️ This post contains: ' + tagSpans + '</div>';
    }

    // ============================================================
    // 10. EDIT POST HANDLER
    // ============================================================

    function handleEdit() {
        if (!isEditPage()) return;

        var textarea = document.querySelector('textarea[name="Post"]');
        if (!textarea) return;

        var content = textarea.value;
        var tagsDiv = extractTagsDiv(content);
        
        if (tagsDiv) {
            var tagIds = [];
            var tagMatches = tagsDiv.match(/tw-tag-([a-z-]+)/g);
            if (tagMatches) {
                for (var i = 0; i < tagMatches.length; i++) {
                    var id = tagMatches[i].replace('tw-tag-', '');
                    if (KEYWORDS[id]) {
                        tagIds.push(id);
                    }
                }
            }

            if (tagIds.length > 0) {
                sessionStorage.setItem('tw_confirmed_tags', JSON.stringify(tagIds));

                var quickTagBtns = document.querySelectorAll('.tw-quick-tag');
                for (var j = 0; j < quickTagBtns.length; j++) {
                    var btn = quickTagBtns[j];
                    var category = btn.dataset.category;
                    var cat = KEYWORDS[category];
                    var label = cat ? cat.label : category;
                    
                    if (tagIds.indexOf(category) !== -1) {
                        btn.classList.add('active');
                        btn.style.opacity = '0.85';
                        btn.textContent = '✕ Remove ' + label;
                        btn.title = 'Click to remove ' + label + ' tag';
                    } else {
                        btn.classList.remove('active');
                        btn.style.opacity = '1';
                        btn.textContent = '+ Add ' + label;
                        btn.title = 'Click to add ' + label + ' tag';
                    }
                }

                var labels = [];
                for (var k = 0; k < tagIds.length; k++) {
                    var catObj = KEYWORDS[tagIds[k]];
                    labels.push(catObj ? catObj.label : tagIds[k]);
                }
                updateStatus('✅ ' + tagIds.length + ' tag(s) loaded: ' + labels.join(', '));
            }
        }
    }

    // ============================================================
    // 11. INITIALIZATION
    // ============================================================

    function init() {
        if (!config.tagAssistant) {
            console.log('[Tag Assistant] Disabled by configuration');
            return;
        }

        if (!isPostingPage()) {
            console.log('[Tag Assistant] Not on posting page, skipping');
            return;
        }

        console.log('[Tag Assistant] Initializing...');
        injectUI();

        if (isEditPage()) {
            handleEdit();
        }

        console.log('[Tag Assistant] Initialized successfully');
    }

    // ============================================================
    // 12. START
    // ============================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
