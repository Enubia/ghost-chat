import type { MessageFragment } from '@/types/chat';

import styles from './ChatMessage.module.css';

interface Options {
    hideGifs?: boolean;
}

export function renderFragments(fragments: MessageFragment[], options: Options = {}) {
    return (
        <span>
            {fragments.map((frag, i) => {
                if (frag.type === 'emote') {
                    return (
                        <img
                            key={i}
                            className={styles.emote}
                            src={frag.url}
                            alt={frag.text}
                            title={frag.text}
                        />
                    );
                }

                if (frag.type === 'gif') {
                    if (options.hideGifs) {
                        return <span key={i}>{frag.text}</span>;
                    }

                    return (
                        <img
                            key={i}
                            className={styles.gif}
                            src={frag.url}
                            alt={frag.text}
                            title={frag.text}
                        />
                    );
                }

                return <span key={i}>{frag.text}</span>;
            })}
        </span>
    );
}
