import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service.js';

@Module({ providers: [ChannelsService], exports: [ChannelsService] })
export class ChannelsModule {}
