import type { MessageFragment } from '@/types/chat';

import styles from './ChatMessage.module.css';

interface Options {
    hideGifs?: boolean;
}

export function renderFragments(fragments: MessageFragment[], options: Options = {}) {
    return (
        <span>
            {fragments.map((frag, i) => {
                if (frag.type === 'text' || (frag.type === 'gif' && options.hideGifs)) {
                    return <span key={i}>{frag.text}</span>;
                }

                return (
                    <img
                        key={i}
                        className={frag.type === 'gif' ? styles.gif : styles.emote}
                        src={frag.url}
                        alt={frag.text}
                        title={frag.text}
                    />
                );
            })}
        </span>
    );
}
