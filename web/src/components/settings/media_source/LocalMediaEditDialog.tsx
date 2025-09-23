import { Add } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { isNonEmptyString, prettifySnakeCaseString } from '@tunarr/shared/util';
import type { LocalMediaSource } from '@tunarr/types';
import { ContentProgramTypeSchema } from '@tunarr/types/schemas';
import { isEmpty, isUndefined } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { MarkOptional, StrictOmit } from 'ts-essentials';
import { postApiMediaSourcesForeignstatusMutation } from '../../../generated/@tanstack/react-query.gen.ts';

type Props = {
  open: boolean;
  onClose: () => void;
  source?: LocalMediaSource;
};

type LocalMediaSourceForm = MarkOptional<
  StrictOmit<LocalMediaSource, 'libraries'>,
  'id'
>;

type LocalMediaSourceForm2 = {
  id?: string;
  name: string;
  type: 'local';
  path: string[];
  mediaType: LocalMediaSource['mediaType'];
};

const emptyDefaults = () =>
  ({
    type: 'local',
    name: '',
    path: [],
    mediaType: 'movie',
  }) satisfies LocalMediaSourceForm2;

export const LocalMediaEditDialog = ({ onClose, open, source }: Props) => {
  const {
    control,
    watch,
    reset,
    formState: { isDirty, isValid, defaultValues, errors },
    handleSubmit,
    setError,
    clearErrors,
    getValues,
  } = useForm<LocalMediaSourceForm2>({
    mode: 'onChange',
    defaultValues: source ?? emptyDefaults(),
  });

  const [currentPath, setCurrentPath] = useState<string>('');
  const pathIsValid = useMemo(() => {
    if (currentPath.length === 0) {
      return false;
    }
    // Simple validation: path must start with /
    if (!currentPath.startsWith('/')) {
      return false;
    }

  const localStatusMut = useMutation({
    ...postApiMediaSourcesForeignstatusMutation(),
  });

  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === 'path') {
        console.log(value);
      }
    });

    return () => sub.unsubscribe();
  }, [watch]);

  const title = source ? `Editing "${source.name}"` : 'New Local Media Source';
  return (
    <Dialog open={open} onClose={onClose} fullWidth keepMounted={false}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Box component="form">
          <Stack spacing={2}>
            <Controller
              control={control}
              name="name"
              rules={{
                required: true,
                minLength: 1,
                pattern: {
                  value: /[A-z0-9_-]+/,
                  message:
                    'Name can only contain alphanumeric characters, dashes, and underscores',
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label="Name"
                  fullWidth
                  {...field}
                  error={!isUndefined(error)}
                  helperText={
                    error && isNonEmptyString(error.message)
                      ? error.message
                      : 'Enter a name for your Local Media Source'
                  }
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Controller
                control={control}
                name="mediaType"
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Select label="Media Type" {...field}>
                    {Object.values(ContentProgramTypeSchema.enum).map(
                      (type) => (
                        <MenuItem value={type} key={type}>
                          {prettifySnakeCaseString(type)}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                )}
              />
              {/* <FormHelperText> </FormHelperText> */}
            </FormControl>

            <Stack direction={'row'} spacing={1} alignItems="center">
              <TextField
                label="Path(s)"
                fullWidth
                value={currentPath}
                onChange={(e) => setCurrentPath(e.target.value)}
                // error={!isUndefined(error)}
              />
              <IconButton>
                <Add />{' '}
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => onClose()} autoFocus>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={
            !isDirty || !isValid || !isEmpty(errors)
            // serverStatus?.healthy === false
          }
          type="submit"
          // onClick={onSubmit}
        >
          {source?.id ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
