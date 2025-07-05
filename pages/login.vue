<script setup lang="ts">
definePageMeta({
  layout: "public",
});
</script>

<template>
  <div class="min-h-screen bg-black relative overflow-hidden">
    <!-- Background with overlay -->
    <div class="absolute inset-0">
      <img 
        src="/img/login/tenbase-hero-bg.jpg" 
        alt="Background"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Logo -->
    <div class="absolute top-6 left-6 z-10">
      <NuxtImg
        class="w-6 h-6 rounded-lg shadow-lg"
        src="/favicon/64.png"
        alt="TENbase"
      />
    </div>

    <!-- Main content -->
    <div class="relative z-10 flex min-h-screen">
      <!-- Left content - Main login area -->
      <div class="max-w-[1080px] mx-auto w-full px-4 flex-1 flex items-center justify-center lg:justify-start lg:pl-16 xl:pl-24">
        <div class="px-6 py-8 w-full max-w-md">
          <!-- Main heading -->
          <div class="mb-12">
            <h1 class="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
              The Way Gaming<br />
              Should Be.
            </h1>
            <p class="text-lg lg:text-xl text-gray-300 leading-relaxed">
              Before gaming lost its way — fair matches, real competition, and a platform that remembers players come first.
            </p>
          </div>

          <!-- Steam login button -->
          <div class="mb-3 text-center">
            <button
              @click="signIn"
              class="w-full min-h-[48px] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 
         flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
         bg-gradient-to-br from-cyan-400 via-blue-500 to-pink-500 opacity-80 hover:opacity-100"
            >
            <div class="flex">
              <img
                src="/img/login/steam.svg"
                alt="Steam"
                class="w-6 h-6 mr-4"
              />
              Sign in through Steam
            </div>
            </button>
            <span class="text-xs text-gray-600 text-center leading-snug">
                This site not associated with Valve Corp.
              </span>
          </div>
          <div class="mb-8">
            <div class="flex justify-center items-center gap-2 text-xs text-gray-400">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <span>SSL Protected</span>
              <span class="mx-1.5">•</span>
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
              </svg>
              <span>Privacy First</span>
            </div>
          </div>

          <!-- Mobile info toggle -->
          <div class="lg:hidden mt-8">
            <button
              @click="showMobileInfo = !showMobileInfo"
              class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <span>{{ showMobileInfo ? 'Hide' : 'More info' }}</span>
              <svg 
                class="w-4 h-4 transform transition-transform"
                :class="{ 'rotate-180': showMobileInfo }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <!-- Mobile info content -->
          <div 
            v-if="showMobileInfo"
            class="lg:hidden mt-6 p-4 bg-black/30 rounded-lg border border-gray-700"
          >
            <h3 class="text-white font-semibold mb-2">STEAM LOGIN ONLY (FOR NOW)</h3>
            <p class="text-gray-300 text-sm mb-4">
              We don't read your chats, friends or inventory. 
              <strong class="text-white">Just your SteamID and nickname</strong> — to match you properly on our servers.
            </p>
            <p class="text-gray-300 text-sm mb-4">
              Later, your <strong class="text-white">TENsoul account</strong> will change everything — unhackable, truly unique, and impossible to duplicate. 
              One person, one account, period. No smurfs, no alts, no fake profiles ruining fair play.
            </p>
            <div class="pt-4 border-t border-gray-700">
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Early Access • Beta Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right content - Info panel (desktop only) -->
      <div class="hidden lg:flex lg:w-80 xl:w-96 relative">
        <div class="absolute inset-0 bg-black/80"></div>
        <div class="relative z-10 p-8 flex flex-col h-full">
          
          <!-- Content centered vertically -->
          <div class="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <h3 class="text-white font-semibold text-lg mb-3">
                STEAM LOGIN ONLY (FOR NOW)
              </h3>
              <p class="text-gray-300 text-sm leading-relaxed">
                We don't read your chats, friends or inventory. 
                <strong class="text-white">Just your SteamID and nickname</strong> — to match you properly on our servers.
              </p>
            </div>

            <div>
              <p class="text-gray-300 text-sm leading-relaxed">
                Later, your <strong class="text-white">TENsoul account</strong> will change everything — unhackable, truly unique, and impossible to duplicate. 
                One person, one account, period. No smurfs, no alts, no fake profiles ruining fair play.
              </p>
            </div>

            <div class="pt-4 border-t border-gray-700">
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Early Access • Beta Coming Soon
              </div>
            </div>
          </div>

          <div class="mt-12 text-center">
            <a
              href="https://github.com/5stackgg/5stack-panel"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-2"
            >
              Powered by 5stack.gg
              <GithubLogoIcon class="w-4 h-4" />
            </a>
            <div class="text-xs text-gray-500">
              &copy; 2025 • Assembled with a lot of ☕ and ❤️ by <a
              href="https://x.com/tenbase_labs"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-2"
            >TENbase Labs</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAuthStore } from "~/stores/AuthStore";
import { GithubLogoIcon } from "@radix-icons/vue";

export default {
  data() {
    return {
      showMobileInfo: false,
    };
  },
  methods: {
    signIn() {
      window.location = this.authLink;
    },
  },
  watch: {
    me: {
      immediate: true,
      handler(me: Record<string, unknown>) {
        if (me) {
          this.$router.push("/");
        }
      },
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    authLink() {
      return `https://${useRuntimeConfig().public.webDomain}/auth/steam?redirect=${encodeURIComponent(
        window.location.toString(),
      )}`;
    },
  },
};
</script>