package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"

	"github.com/EngineeringKiosk/website/website-admin/utils"
)

const (
	awesomeMoviesGitRepo          = "https://github.com/EngineeringKiosk/awesome-software-engineering-movies.git"
	awesomeMoviesRepoName         = "awesome-software-engineering-movies"
	awesomeMoviesJSONPathInRepo   = "generated"
	awesomeMoviesImagesPathInRepo = "generated/images"
	awesomeMoviesDefaultStorage   = "src/content/awesome-software-engineering-movies"
)

// syncAwesomeSoftwareEngineeringMoviesCmd represents the awesome-software-engineering-movies sync command
var syncAwesomeSoftwareEngineeringMoviesCmd = &cobra.Command{
	Use:   "awesome-software-engineering-movies",
	Short: "Sync the Awesome Software Engineering Movies catalog from GitHub",
	Long: `Sync data from the Awesome Software Engineering Movies community repository.

The Engineering Kiosk website features a catalog of films, documentaries and
long-form videos that are relevant to software engineers — covering programming
language histories, open source culture, computer science milestones, and more.
This curated list is maintained as a separate community-driven GitHub repository,
and this command synchronizes that data into the website's content directory.

Source repository: https://github.com/EngineeringKiosk/awesome-software-engineering-movies

What this command does:
  1. Clones the awesome-software-engineering-movies repository to a temporary directory (shallow clone)
  2. Copies all JSON data files from generated/ to the local content directory
  3. Copies all thumbnail images from generated/images/
  4. Rewrites the "image" field in each JSON file to a path relative to the JSON file
     (e.g., "images/foo.jpg" -> "./foo.jpg") so the Astro content loader can resolve it
  5. Cleans up the temporary clone

Each JSON file contains structured movie metadata: name, slug, YouTube link and video
ID, language, tags, description, ISO-8601 duration, publication date, channel info,
view count, and a thumbnail image reference.

This command should be run periodically — and is run automatically by GitHub Actions
on the "movie-list-update" repository_dispatch event — to pull in new entries from the
community repository.`,
	Example: `  # Sync movies catalog using default paths (run from project root)
  website-admin sync awesome-software-engineering-movies

  # Specify a custom storage path for JSON and images
  website-admin sync awesome-software-engineering-movies --storage-path ./custom/content/movies

  # Enable debug logging to see detailed file operations
  website-admin sync awesome-software-engineering-movies --debug

  # Disable all logging for quiet operation (useful in scripts)
  website-admin sync awesome-software-engineering-movies --disable-logging`,
	RunE:              RunSyncAwesomeSoftwareEngineeringMoviesCmd,
	DisableAutoGenTag: true,
}

func init() {
	syncCmd.AddCommand(syncAwesomeSoftwareEngineeringMoviesCmd)

	syncAwesomeSoftwareEngineeringMoviesCmd.Flags().StringVarP(&flagSyncAwesomeMoviesStoragePath, "storage-path", "s", "", "Path to store JSON and image files (default: src/content/awesome-software-engineering-movies)")
}

func RunSyncAwesomeSoftwareEngineeringMoviesCmd(cmd *cobra.Command, args []string) error {
	logger := utils.GetLogger(flagDisableLogging, flagDebugLogging)
	logger.Info().
		Str("cmd", cmd.Use).
		Msg("starting")

	storagePath := flagSyncAwesomeMoviesStoragePath
	if storagePath == "" {
		storagePath = awesomeMoviesDefaultStorage
	}
	storagePath = utils.BuildCorrectFilePath(storagePath)

	tmpDir, err := os.MkdirTemp("", awesomeMoviesRepoName+"-*")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer func() {
		logger.Info().
			Str("path", tmpDir).
			Msg("Cleaning up temp directory")
		if err := os.RemoveAll(tmpDir); err != nil {
			logger.Warn().Err(err).Msg("Failed to remove temp directory")
		}
	}()

	if err := cloneRepository(logger, awesomeMoviesGitRepo, tmpDir); err != nil {
		return err
	}

	jsonSourceDir := filepath.Join(tmpDir, awesomeMoviesJSONPathInRepo)
	if err := syncJSONFiles(logger, jsonSourceDir, storagePath, rewriteImageToRelative); err != nil {
		return err
	}

	imagesSourceDir := filepath.Join(tmpDir, awesomeMoviesImagesPathInRepo)
	if err := syncImageFiles(logger, imagesSourceDir, storagePath); err != nil {
		return err
	}

	logger.Info().Msg("Sync completed successfully")
	return nil
}
