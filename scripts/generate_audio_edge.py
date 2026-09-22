import asyncio
import os
import re
import json
import edge_tts
import unicodedata

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(BASE_DIR, 'public', 'assets', 'audio')
AUDIO_MAP_PATH = os.path.join(BASE_DIR, 'src', 'utils', 'audioMap.js')
os.makedirs(AUDIO_DIR, exist_ok=True)

# High-quality friendly child/learning voice
VOICE = "en-US-AnaNeural"

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '_', text).strip('-_')
    return text[:60]

def clean_for_speech(text):
    """Remove emojis and non-pronounceable glyphs before TTS."""
    s = re.sub(r'[\U00010000-\U0010ffff]', '', text) # remove 4-byte unicode/emojis
    s = re.sub(r'[\u2600-\u27bf]', '', s) # misc symbols
    return s

def math_to_spoken(text):
    """Convert mathematical symbols and ratio notation to natural spoken English for TTS."""
    s = clean_for_speech(text)

    # Currency formatting
    s = re.sub(r'\$(\d+)', r'\1 dollars', s)

    # Ratio notation: "4 : 5" -> "4 to 5", "1 : 2 : 3" -> "1 to 2 to 3"
    s = re.sub(r'(\d+)\s*:\s*(\d+)\s*:\s*(\d+)', r'\1 to \2 to \3', s)
    s = re.sub(r'(\d+)\s*:\s*(\d+)', r'\1 to \2', s)

    # Fractions
    s = re.sub(r'\b1/2\b', 'one half', s)
    s = re.sub(r'\b1/3\b', 'one third', s)
    s = re.sub(r'\b2/3\b', 'two thirds', s)
    s = re.sub(r'\b1/4\b', 'one fourth', s)
    s = re.sub(r'\b3/4\b', 'three fourths', s)
    s = re.sub(r'\b1/5\b', 'one fifth', s)
    s = re.sub(r'\b2/5\b', 'two fifths', s)
    s = re.sub(r'\b3/5\b', 'three fifths', s)
    s = re.sub(r'\b4/5\b', 'four fifths', s)
    s = re.sub(r'\b1/6\b', 'one sixth', s)
    s = re.sub(r'\b5/6\b', 'five sixths', s)
    s = re.sub(r'\b1/8\b', 'one eighth', s)
    s = re.sub(r'\b3/8\b', 'three eighths', s)
    s = re.sub(r'\b5/8\b', 'five eighths', s)
    s = re.sub(r'\b7/8\b', 'seven eighths', s)

    # Math operators
    s = s.replace(' ÷ ', ' divided by ')
    s = s.replace('÷', ' divided by ')
    s = s.replace(' × ', ' times ')
    s = s.replace('×', ' times ')
    s = s.replace(' = ', ' equals ')
    s = s.replace('=', ' equals ')
    s = s.replace(' + ', ' plus ')
    s = s.replace(' − ', ' minus ')
    s = s.replace(' - ', ' minus ')
    s = s.replace('➔', ' to ')
    s = s.replace('->', ' to ')
    s = s.replace('✓', 'correct')

    # Units
    s = re.sub(r'\b(\d+)\s*kg\b', r'\1 kilograms', s)
    s = re.sub(r'\b(\d+)\s*g\b', r'\1 grams', s)
    s = re.sub(r'\b(\d+)\s*L\b', r'\1 litres', s)
    s = re.sub(r'\b(\d+)\s*cm\b', r'\1 centimetres', s)
    s = re.sub(r'\b(\d+)\s*m\b', r'\1 metres', s)

    # Clean up formatting
    s = s.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def extract_phrases():
    phrases = []
    seen = set()

    def add(text):
        if not text:
            return
        t = text.strip()
        if len(t) < 2 or t in seen:
            return
        seen.add(t)
        phrases.append(t)

    # 1. UI Confirmation sounds
    add("Sound on!")
    add("Sound off")
    add("Ready to split sweets, money and paint fairly using ratios? Let's go!")
    add("Ready to split sweets, money and paint fairly using ratios? Let's go! 🍬")

    # 2. Wonder phase
    add("Robo has 45 sweets to share between Aisha and Ben in the ratio 4 to 5. Robo's friend says you should just cut the 45 in half, because sharing means everyone gets the same. Is that actually right?")
    add("Robo shares 45 sweets between Aisha and Ben in the ratio 4 : 5. Robo's friend says just cut the 45 in half, because sharing means everyone gets the same. Is that actually right?")
    add("Not right at all! Sharing in a ratio means splitting into EQUAL PARTS, not equal shares. 4 plus 5 makes 9 equal parts, each worth 5 sweets — so Aisha gets 20 and Ben gets 25. Let's learn every step in the story!")
    add("Notice it! Sharing in a ratio means equal PARTS, not equal shares — the person with more parts gets more sweets.")
    add("Equal PARTS, not equal shares! 🍬")
    add("Hmm... I wonder... 🤔")

    # 3. Story phase
    add("Robo writes the ratio 4 : 5 and reads it aloud as “four parts to five parts”. A ratio compares PARTS against each other, not against the whole. Every single block is the same size — Aisha simply holds 4 of them and Ben holds 5.")
    add('Robo writes the ratio 4 : 5 and reads it aloud as "four parts to five parts". A ratio compares PARTS against each other, not against the whole. Every single block is the same size — Aisha simply holds 4 of them and Ben holds 5.')
    add("Step 1: ADD the ratio numbers — 4 + 5 = 9, so the jar splits into 9 equal parts. Step 2: divide the total by that number — 45 ÷ 9 = 5. Now Robo knows the magic number: every single part is worth 5 sweets.")
    add("Step 3: multiply each ratio number by the value of one part. Aisha has 4 parts, so 4 × 5 = 20 sweets. Ben has 5 parts, so 5 × 5 = 25 sweets. The person with more parts gets more sweets — that is what sharing in a ratio means.")
    add("Step 4: add every share together. 20 + 25 = 45, which matches the original total exactly. If your shares ever fail to add back to the starting amount, something went wrong — so this final check catches almost every mistake.")

    # 4. Simulate stations
    add("Welcome to the Ratio Bar Lab! Change the ratio and the total, and watch the bar model rebuild itself block by block. Try every preset!")
    add("Station B — Step Builder! Solve one whole problem by unlocking each of the four steps in order. No skipping ahead!")
    add("Station C — Reverse Detective! This time you know just ONE share. Work backwards to find the total or the other share.")
    add("Station D — Real-World Ratio Lab! Pick a real scenario, then set each person's share correctly to finish the split.")

    # Station feedback & resets
    add("Not quite — look carefully at the bar model above and try that step again.")
    add("Next step! Keep going.")
    add("New problem! Start again from step one.")
    add("Superb! You've built every solution step by step. Station B is complete!")
    add("Not quite — first divide the known share by its number of parts to find ONE part.")
    add("Next case! Work backwards from the known share.")
    add("Brilliant detective work! Station C is complete!")
    add("Outstanding! You've shared every real-world amount correctly. Station D is complete! You can now begin the challenge game!")
    add("Station A reset! Change the ratio or tap a preset.")
    add("Station B reset! Let's build a solution from step one.")
    add("Station C reset! Find the missing totals.")
    add("Station D reset! Pick a real-world scenario to share out.")

    # Station A presets
    presets = [
        ([2, 3], 40),
        ([1, 4], 50),
        ([3, 1], 36),
        ([1, 2, 3], 60),
        ([5, 5], 80),
    ]
    for parts, amount in presets:
        tp = sum(parts)
        unit = amount / tp
        unit_str = str(int(unit)) if unit.is_integer() else f"{unit:.2f}"
        ratio_str = ' : '.join(map(str, parts))
        add(f"Ratio {ratio_str} sharing {amount}. Total parts {tp}, one part is {unit_str}.")

    # Station B step working
    add("4 + 5 = 9")
    add("45 sweets ÷ 9 = 5 sweets")
    add("Aisha: 4 × 5 = 20 sweets   |   Ben: 5 × 5 = 25 sweets")
    add("20 + 25 = 45 sweets")

    add("1 + 2 + 3 = 6")
    add("60 ÷ 6 = 10")
    add("Cara: 1 × 10 = 10   |   Dev: 2 × 10 = 20   |   Eli: 3 × 10 = 30")
    add("10 + 20 + 30 = 60")

    add("3 + 1 = 4")
    add("800 g ÷ 4 = 200 g")
    add("Flour: 3 × 200 = 600 g   |   Sugar: 1 × 200 = 200 g")
    add("600 + 200 = 800 g")

    # Station C detective working
    add("Maya's 2 parts = $14, so 1 part = $7. Total parts = 5, so total = 5 × $7 = $35.")
    add("Raj's 4 parts = 24, so 1 part = 6. Priya has 3 parts, so 3 × 6 = 18 sweets.")
    add("Sam's 1 part = 9, so 1 part = 9. Total parts = 6, so total = 6 × 9 = 54 stickers.")
    add("Vik's 5 parts = 35, so 1 part = 7. Uma has 2 parts = 14. Difference = 35 − 14 = 21.")
    add("Wen's 4 parts = 32, so 1 part = 8. Xia has 3 parts, so 3 × 8 = 24.")

    # Station C detective questions
    add("Maya and Noah share money in the ratio 2 : 3. Maya receives $14. What was the TOTAL amount?")
    add("Priya and Raj share sweets in the ratio 3 : 4. Raj gets 24 sweets. How many does PRIYA get?")
    add("Sam and Tara share stickers in the ratio 1 : 5. Sam has 9 stickers. What is the TOTAL?")
    add("Uma and Vik share in the ratio 2 : 5. Vik gets 35. How many MORE does Vik get than Uma?")
    add("Wen and Xia share in the ratio 4 : 3. Wen receives 32. What does XIA receive?")

    # Station D Real-world scenarios
    add("Aisha and Ben share 45 sweets in the ratio 4 : 5. How many sweets does each get?")
    add("Cara, Dev and Eli split $120 prize money in the ratio 1 : 2 : 3. How much does each receive?")
    add("A painter mixes 30 L of green paint using blue and yellow in the ratio 2 : 3. How much of each colour?")
    add("A cake uses 800 g of dry mix with flour and sugar in the ratio 3 : 1. How much of each ingredient?")

    add("Perfect split! Aisha gets 20, Ben gets 25.")
    add("Perfect split! Cara gets 20, Dev gets 40, Eli gets 60.")
    add("Perfect split! Blue gets 12, Yellow gets 18.")
    add("Perfect split! Flour gets 600, Sugar gets 200.")

    # 5. Praises & Play phase general
    praises = ["Excellent!", "Well done!", "Brilliant!", "You got it!", "Super smart!"]
    for p in praises:
        add(p)

    add("That's correct!")
    add("Not quite!")
    add("Not quite! Oh no, you have run out of hearts. Let's retry this world.")

    worlds = [
        "Reading Ratios",
        "Finding One Part",
        "Two-Way Sharing",
        "Three-Way Sharing",
        "Simplifying Ratios",
        "Working Backwards",
        "Difference Problems",
        "Ratio & Fractions",
        "Real World Sharing",
        "Mystery Ratio Detective"
    ]
    for idx, wname in enumerate(worlds):
        add(f"Welcome to World {idx + 1}: {wname}. Let's answer some questions!")
        for stars in [1, 2, 3]:
            for score in range(5, 11):
                add(f"Fabulous! You completed the world with {stars} stars and a score of {score} out of 10.")

    # 6. Question Bank (parsing questionBank.js)
    qb_path = os.path.join(BASE_DIR, 'src', 'data', 'questionBank.js')
    if os.path.exists(qb_path):
        with open(qb_path, 'r', encoding='utf-8') as f:
            content = f.read()

        q_matches = re.findall(r'questionText\s*:\s*["\'](.*?)["\']', content)
        for q in q_matches:
            add(q)

        h1_matches = re.findall(r'hint1\s*:\s*["\'](.*?)["\']', content)
        for h in h1_matches:
            add(h)

        h2_matches = re.findall(r'hint2\s*:\s*["\'](.*?)["\']', content)
        for h in h2_matches:
            add(h)

        exp_matches = re.findall(r'explanation\s*:\s*["\'](.*?)["\']', content)
        for exp in exp_matches:
            add(exp)

    # 7. Reflect Phase prompts & explanations
    add("What does a ratio like 4 : 5 actually tell you?")
    add("It compares PARTS against each other, not against the whole. Every block is the same size — one person simply holds 4 of them and the other holds 5. And order matters: 4 : 5 is not the same as 5 : 4.")

    add("Walk me through the four steps for sharing an amount in a ratio.")
    add("Step 1: ADD the ratio numbers to get the total parts. Step 2: DIVIDE the total amount by that to find one part. Step 3: MULTIPLY one part by each ratio number to get each share. Step 4: ADD the shares to check they match the original total.")

    add("Does simplifying a ratio change how the amount is shared?")
    add("Not at all. 6 : 9 and 2 : 3 produce exactly the same shares — simplifying just gives you smaller, friendlier numbers to work with. Divide every ratio number by their highest common factor.")

    add("If you only know ONE person's share, how do you find the total?")
    add("Work backwards. Divide that known share by ITS number of parts to find one part, then multiply by the total parts. If you are told the DIFFERENCE instead, divide it by the difference in parts first.")

    add("How do you turn a ratio into a fraction of the whole?")
    add("Add the parts to get the denominator, and use that person's parts as the numerator. In 2 : 3 the total is 5 parts, so the first person gets 2/5 and the second gets 3/5 of the whole.")

    add("Where would you actually use sharing in a ratio in real life?")
    add("Splitting prize money fairly, mixing paint or concrete to the right recipe, sharing sweets between friends, or dividing a lesson into theory and practical time — ratios keep every one of them fair and consistent.")

    add("Amazing work! Let's reflect a little! 📋")

    return phrases

async def generate_file(text, index, total):
    spoken = math_to_spoken(text)
    slug = slugify(spoken if len(spoken) < 50 else text)
    filename = f"{slug}_{index}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        return text, f"/assets/audio/{filename}"

    try:
        comm = edge_tts.Communicate(spoken, VOICE)
        await comm.save(filepath)
        clean_preview = clean_for_speech(text[:40]).encode('ascii', 'ignore').decode('ascii')
        print(f"[{index + 1}/{total}] Generated: {clean_preview} -> {filename}")
        return text, f"/assets/audio/{filename}"
    except Exception as e:
        print(f"Error generating file index {index}: {e}")
        # Try a quick retry
        try:
            await asyncio.sleep(1)
            comm = edge_tts.Communicate(spoken, VOICE)
            await comm.save(filepath)
            return text, f"/assets/audio/{filename}"
        except Exception as e2:
            print(f"Retry failed for index {index}: {e2}")
            return None, None

async def main():
    phrases = extract_phrases()
    print(f"Total phrases to generate: {len(phrases)}")

    audio_map = {}
    sem = asyncio.Semaphore(5) # limit concurrency to avoid edge-tts throttle

    async def worker(text, idx):
        async with sem:
            t, url = await generate_file(text, idx, len(phrases))
            if t and url:
                audio_map[t] = url

    tasks = [worker(text, i) for i, text in enumerate(phrases)]
    await asyncio.gather(*tasks)

    # Write audioMap.js
    with open(AUDIO_MAP_PATH, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated by scripts/generate_audio_edge.py — DO NOT edit by hand.\n")
        f.write(f"export const audioMap = {json.dumps(audio_map, indent=2, ensure_ascii=False)};\n")

    print(f"\nSUCCESS: Generated {len(audio_map)} entries in audioMap.js")

if __name__ == '__main__':
    asyncio.run(main())
