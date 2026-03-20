/**
 * @license https://github.com/Intermesh/goui/blob/main/LICENSE MIT License
 * @copyright Copyright 2023 Intermesh BV
 * @author Merijn Schering <mschering@intermesh.nl>
 */
/**
 * Class to strip quotes like when someone replies to an email of a string
 *
 * @category Utility
 */
export declare class QuoteStripper {
    readonly body: string;
    private bodyWithoutQuote?;
    private quote?;
    private lines?;
    private quoteIndex?;
    constructor(body: string);
    getBodyWithoutQuote(): string;
    getQuote(): string;
    private split;
    private findByBlockQuote;
    private splitLines;
    /**
     * eg
     *
     * Van: Merijn Schering [mailto:mschering@intermesh.nl]
      Verzonden: donderdag 20 november 2014 16:40
      Aan: Someone
      Onderwerp: Subject
     *
     * @return int|boolean
     */
    private findQuoteByHeaderBlock;
}
