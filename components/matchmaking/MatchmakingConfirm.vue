<script setup lang="ts">
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
</script>

<template>
  <AlertDialog :open="!!shouldShow">
    <AlertDialogContent>
      <div class="flex flex-col items-center justify-center py-6">
        <div class="text-3xl font-bold text-red-600 tracking-widest">
          {{
            remainingSeconds < 10
              ? `00:0${remainingSeconds}`
              : `00:${remainingSeconds}`
          }}
        </div>

        <div class="text-gray-400 text-md mb-4 text-center tracking-widest">
          WAITING FOR PLAYERS...
        </div>
        <div class="flex justify-center items-center mb-6">
          <template v-for="i in confirmation?.players" :key="i">
            <span
              v-if="i <= (confirmation?.confirmed || 0)"
              class="w-4 h-4 mx-1 rounded-full bg-green-500 border border-green-400"
            ></span>
            <span
              v-else
              class="w-4 h-4 mx-1 rounded-full border border-gray-500"
            ></span>
          </template>
        </div>

        <Button
          v-show="!confirmation?.isReady"
          @click="ready"
          variant="default"
          size="lg"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 text-xl rounded-sm shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full p-8"
        >
          <span class="flex items-center justify-center"> READY </span>
        </Button>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script lang="ts">
import { useMatchmakingStore } from "~/stores/MatchmakingStore";
import socket from "~/web-sockets/Socket";

export default {
  data() {
    return {
      remainingSeconds: 0,
      routedConfirmedId: undefined as string | undefined,
      countdownInterval: undefined as NodeJS.Timeout | undefined,
    };
  },
  computed: {
    confirmation() {
      return useMatchmakingStore().joinedMatchmakingQueues?.confirmation;
    },
    shouldShow() {
      if (!this.confirmation || this.confirmation.matchId || this.isExpired) {
        return false;
      }
      return true;
    },
    isExpired() {
      if (!this.confirmation) {
        return true;
      }
      return new Date(this.confirmation.expiresAt) <= new Date();
    },
  },
  watch: {
    confirmation: {
      immediate: true,
      handler() {
        this.updateCountdown();
        if (this.confirmation?.matchId) {
          if (this.routedConfirmedId !== this.confirmation.matchId) {
            this.routedConfirmedId = this.confirmation.matchId;
            this.$router.push(`/matches/${this.confirmation.matchId}`);
          }
        }
      },
    },
  },
  methods: {
    ready() {
      if (!this.confirmation) {
        return;
      }
      socket.event("matchmaking:confirm", {
        confirmationId: this.confirmation.confirmationId,
      });
    },
    updateCountdown() {
      if (this.confirmation?.expiresAt) {
        const expiresAt = new Date(this.confirmation.expiresAt).getTime();
        const now = new Date().getTime();
        const difference = Math.max(0, Math.floor((expiresAt - now) / 1000));
        this.remainingSeconds = difference;
      }
    },
  },
  mounted() {
    this.updateCountdown();
    this.countdownInterval = setInterval(this.updateCountdown, 1000);
  },
  beforeUnmount() {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
    }
  },
};
</script>
