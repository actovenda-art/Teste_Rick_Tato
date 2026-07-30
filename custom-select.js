(() => {
    'use strict';

    const selects = document.querySelectorAll('.contact-form select[name="location"]');
    if (!selects.length) return;

    let openSelect = null;

    const closeSelect = (instance, returnFocus = false) => {
        if (!instance) return;
        instance.wrapper.classList.remove('is-open', 'opens-up');
        instance.trigger.setAttribute('aria-expanded', 'false');
        instance.list.setAttribute('aria-hidden', 'true');
        if (openSelect === instance) openSelect = null;
        if (returnFocus) instance.trigger.focus();
    };

    const openDropdown = (instance, focusDirection = 0) => {
        if (openSelect && openSelect !== instance) closeSelect(openSelect);

        const bounds = instance.wrapper.getBoundingClientRect();
        const listHeight = Math.min(instance.list.scrollHeight, 280) + 12;
        const spaceBelow = window.innerHeight - bounds.bottom;
        instance.wrapper.classList.toggle(
            'opens-up',
            spaceBelow < listHeight && bounds.top > listHeight,
        );
        instance.wrapper.classList.add('is-open');
        instance.trigger.setAttribute('aria-expanded', 'true');
        instance.list.setAttribute('aria-hidden', 'false');
        openSelect = instance;

        if (focusDirection) {
            const selectedIndex = instance.options.findIndex(
                (option) => option.getAttribute('aria-selected') === 'true',
            );
            const fallbackIndex = focusDirection > 0 ? 0 : instance.options.length - 1;
            const targetIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex;
            instance.options[targetIndex]?.focus();
        }
    };

    selects.forEach((select, index) => {
        if (select.dataset.customSelect === 'ready') return;
        select.dataset.customSelect = 'ready';

        const wrapper = document.createElement('span');
        wrapper.className = 'custom-select';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        select.classList.add('custom-select-native');
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');

        const listId = `custom-select-list-${index + 1}`;
        const trigger = document.createElement('button');
        trigger.className = 'custom-select-trigger';
        trigger.type = 'button';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', listId);

        const list = document.createElement('span');
        list.className = 'custom-select-list';
        list.id = listId;
        list.setAttribute('role', 'listbox');
        list.setAttribute('aria-hidden', 'true');

        wrapper.append(trigger, list);

        const instance = {
            list,
            options: [],
            select,
            trigger,
            wrapper,
        };

        [...select.options].forEach((nativeOption) => {
            if (nativeOption.disabled || !nativeOption.value) return;

            const option = document.createElement('button');
            option.className = 'custom-select-option';
            option.type = 'button';
            option.setAttribute('role', 'option');
            option.dataset.value = nativeOption.value;
            option.innerHTML = `<span>${nativeOption.textContent}</span><span class="custom-select-check" aria-hidden="true">✓</span>`;
            list.appendChild(option);
            instance.options.push(option);

            option.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                select.value = nativeOption.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closeSelect(instance, true);
            });
        });

        const syncSelection = () => {
            const selectedText = select.selectedOptions[0]?.textContent || 'Select an option';
            trigger.setAttribute('aria-label', `${select.name}: ${selectedText}`);
            wrapper.classList.remove('is-invalid');
            instance.options.forEach((option) => {
                option.setAttribute(
                    'aria-selected',
                    String(option.dataset.value === select.value),
                );
            });
        };

        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (wrapper.classList.contains('is-open')) {
                closeSelect(instance);
            } else {
                openDropdown(instance);
            }
        });

        trigger.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                openDropdown(instance, event.key === 'ArrowUp' ? -1 : 1);
            } else if (event.key === 'Escape') {
                closeSelect(instance);
            }
        });

        list.addEventListener('keydown', (event) => {
            const currentIndex = instance.options.indexOf(document.activeElement);

            if (event.key === 'Escape') {
                event.preventDefault();
                closeSelect(instance, true);
                return;
            }

            if (event.key === 'Tab') {
                closeSelect(instance);
                return;
            }

            let nextIndex = currentIndex;
            if (event.key === 'ArrowDown') nextIndex += 1;
            if (event.key === 'ArrowUp') nextIndex -= 1;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = instance.options.length - 1;
            if (nextIndex === currentIndex) return;

            event.preventDefault();
            nextIndex = Math.max(0, Math.min(instance.options.length - 1, nextIndex));
            instance.options[nextIndex]?.focus();
        });

        select.addEventListener('change', syncSelection);
        select.addEventListener('invalid', (event) => {
            event.preventDefault();
            wrapper.classList.add('is-invalid');
            trigger.focus();
        });
        select.form?.addEventListener('reset', () => {
            window.setTimeout(syncSelection, 0);
        });

        syncSelection();
    });

    document.addEventListener('pointerdown', (event) => {
        if (openSelect && !openSelect.wrapper.contains(event.target)) {
            closeSelect(openSelect);
        }
    });
})();
