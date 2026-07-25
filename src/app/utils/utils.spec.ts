import { getClosestPaletteEntry } from './utils';
import { Palette, PaletteEntry } from '../model/palette/palette.model';
import { Color } from '../model/color/color.model';
import { MATCHINGS } from '../model/matching/matching.model';

describe('getClosestPaletteEntry', () => {
    let red: PaletteEntry;
    let green: PaletteEntry;
    let blue: PaletteEntry;
    let white: PaletteEntry;
    let palette: Palette;

    beforeEach(() => {
        red = new PaletteEntry('Red', new Color(255, 0, 0, 255));
        green = new PaletteEntry('Green', new Color(0, 255, 0, 255));
        blue = new PaletteEntry('Blue', new Color(0, 0, 255, 255));
        white = new PaletteEntry('White', new Color(255, 255, 255, 255));
        palette = new Palette('Test', [red, green, blue, white]);
    });

    it('returns an entry that belongs to one of the given palettes', () => {
        const queryColors = [
            new Color(10, 10, 10, 255),
            new Color(200, 20, 30, 255),
            new Color(20, 200, 30, 255),
            new Color(30, 20, 200, 255),
            new Color(240, 240, 240, 255),
        ];

        queryColors.forEach((query) => {
            const result = getClosestPaletteEntry(
                [palette],
                query,
                MATCHINGS.EUCLIDEAN
            );
            expect(palette.entries).toContain(result);
        });
    });

    it('never returns a disabled entry, even if it is the closest color', () => {
        red.enabled = false;

        const result = getClosestPaletteEntry(
            [palette],
            new Color(255, 0, 0, 255),
            MATCHINGS.EUCLIDEAN
        );

        expect(result).not.toBe(red);
        expect(result.enabled).toBe(true);
    });

    it('returns the entry with the true minimum distance among enabled entries', () => {
        const queryColors = [
            new Color(10, 10, 10, 255),
            new Color(180, 60, 40, 255),
            new Color(40, 180, 60, 255),
            new Color(60, 40, 180, 255),
            new Color(230, 230, 230, 255),
            new Color(128, 128, 128, 255),
        ];

        queryColors.forEach((query) => {
            const result = getClosestPaletteEntry(
                [palette],
                query,
                MATCHINGS.EUCLIDEAN
            );

            const bruteForceMinDistance = Math.min(
                ...palette.entries
                    .filter((e) => e.enabled)
                    .map((e) => MATCHINGS.EUCLIDEAN.delta(e.color, query))
            );
            const resultDistance = MATCHINGS.EUCLIDEAN.delta(
                result.color,
                query
            );

            expect(resultDistance).toBe(bruteForceMinDistance);
        });
    });

    it('considers entries across multiple palettes combined', () => {
        const yellow = new PaletteEntry(
            'Yellow',
            new Color(255, 255, 0, 255)
        );
        const secondPalette = new Palette('Second', [yellow]);

        const result = getClosestPaletteEntry(
            [palette, secondPalette],
            new Color(250, 250, 10, 255),
            MATCHINGS.EUCLIDEAN
        );

        expect(result).toBe(yellow);
    });
});
