import cron, { ScheduledTask } from 'node-cron';
import { SubscriptionService } from './subscription.service.js';
import { connectDatabase } from '../config/database.js';

/**
 * Service for managing scheduled tasks
 */
export class SchedulerService {
  private static tasks: ScheduledTask[] = [];

  /**
   * Initialize all scheduled tasks
   */
  static async initialize(): Promise<void> {
    try {
      // Ensure database connection before starting schedulers
      await connectDatabase();

      // Schedule subscription expiration: Last day of each month at 23:59
      // Cron expression: "59 23 28-31 * *" runs on days 28-31 at 23:59
      // We'll use a more specific approach: check daily and expire if it's the last day of month
      const subscriptionExpirationTask = cron.schedule(
        '0 0 1 * *', // Run at midnight on the 1st day of each month (to expire previous month)
        async () => {
          console.log('🔄 Running scheduled subscription expiration...');
          try {
            const result = await SubscriptionService.expireSubscriptions();
            if (result.success) {
              console.log(
                `✅ Subscription expiration completed: ${result.expiredCount} subscriptions expired`
              );
            } else {
              console.error('❌ Subscription expiration failed:', result.errors);
            }
          } catch (error) {
            console.error('❌ Error in subscription expiration scheduler:', error);
          }
        },
        {
          timezone: 'America/Lima', // Adjust to your timezone
        }
      );
      // Don't start immediately - will be started by start() method
      subscriptionExpirationTask.stop();

      // Alternative: Run daily check at end of month
      // This checks daily if it's the last day of the month
      const dailyCheckTask = cron.schedule(
        '59 23 * * *', // Run at 23:59 every day
        async () => {
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // If tomorrow is the 1st of the month, expire subscriptions today
          if (tomorrow.getDate() === 1) {
            console.log('🔄 Running end-of-month subscription expiration...');
            try {
              const result = await SubscriptionService.expireSubscriptions();
              if (result.success) {
                console.log(
                  `✅ End-of-month subscription expiration completed: ${result.expiredCount} subscriptions expired`
                );
              } else {
                console.error('❌ Subscription expiration failed:', result.errors);
              }
            } catch (error) {
              console.error('❌ Error in subscription expiration scheduler:', error);
            }
          }
        },
        {
          timezone: 'America/Lima', // Adjust to your timezone
        }
      );
      // Don't start immediately - will be started by start() method
      dailyCheckTask.stop();

      this.tasks.push(subscriptionExpirationTask, dailyCheckTask);

      console.log('✅ Scheduler service initialized');
    } catch (error) {
      console.error('❌ Error initializing scheduler service:', error);
      throw error;
    }
  }

  /**
   * Start all scheduled tasks
   */
  static start(): void {
    this.tasks.forEach((task) => {
      task.start();
      console.log('▶️  Started scheduled task');
    });
  }

  /**
   * Stop all scheduled tasks
   */
  static stop(): void {
    this.tasks.forEach((task) => {
      task.stop();
      console.log('⏹️  Stopped scheduled task');
    });
  }

  /**
   * Get status of all scheduled tasks
   */
  static getStatus(): { running: boolean; taskCount: number } {
    return {
      running: this.tasks.length > 0,
      taskCount: this.tasks.length,
    };
  }

  /**
   * Manually trigger subscription expiration (for testing)
   */
  static async triggerSubscriptionExpiration(): Promise<void> {
    console.log('🔧 Manually triggering subscription expiration...');
    try {
      const result = await SubscriptionService.expireSubscriptions();
      if (result.success) {
        console.log(
          `✅ Manual subscription expiration completed: ${result.expiredCount} subscriptions expired`
        );
      } else {
        console.error('❌ Manual subscription expiration failed:', result.errors);
      }
    } catch (error) {
      console.error('❌ Error in manual subscription expiration:', error);
      throw error;
    }
  }
}

