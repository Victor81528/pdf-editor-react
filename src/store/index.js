import { create } from 'zustand'
import { mountStoreDevtool } from 'simple-zustand-devtools';

const useStore = create((set) => ({
    comp: 'Select',
    setComp: (component) => set((state) => ({comp: component})),

    isLoading: false,
    setLoading: (boolean) => set(() => ({isLoading: boolean})),

    pdfs: [],
    addToPdfs: (object) => set((state) => ({pdfs: [...state.pdfs, object]})),

    images: [],
    addToImages: (object) => set((state) => ({images: [...state.images, object]})),
    setImage: (index, object) => set((state) => (
        state.images[index] = {...state.images[index], ...object}
    )),
    setAllImage: (array) => set(() => ({images: array})),
    removeImage: (index) => set((state) => (state.images.pop(index)))
}))

if (process.env.NODE_ENV === 'development') {
    mountStoreDevtool('Store', useStore);
}

export default useStore