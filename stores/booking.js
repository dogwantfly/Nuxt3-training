import { defineStore } from 'pinia';
export const useBookingStore = defineStore('booking', {
  state: () => ({
    bookingDate: null,
    roomId: null,
    bookingNum: 1
  }),
  actions: {
    setBookingInfo(bookingInfo) {
      this.bookingDate = bookingInfo.bookingDate;
      this.roomId = bookingInfo.roomId;
      this.bookingNum = bookingInfo.bookingNum;
      localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
    },
    resetBookingInfo() {
      this.bookingDate = null;
      this.roomId = null;
      this.bookingNum = 1;
      localStorage.removeItem('bookingInfo');
    }
  }
});
